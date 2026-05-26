'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * AI 教练对话云函数
 * 提供流式响应的智能跑步教练对话
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { sessionId, message, context: clientContext = {} } = event

  // 1. 加载用户数据和训练背景
  const user = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const plan = await db.collection('training_plans')
    .where({ _openid: openid, status: 'active' }).limit(1).get()

  // 2. 加载对话历史
  const chatDoc = await db.collection('chat_history')
    .where({ _openid: openid, session_id: sessionId }).limit(1).get()

  const historyMessages = chatDoc.data?.[0]?.messages || []

  // 3. 构建系统提示词
  const systemPrompt = buildCoachPrompt(user.data[0], plan.data[0], clientContext)

  // 4. 构建消息数组（只取最近20条避免超长）
  const recentMessages = historyMessages.slice(-20).map(m => ({
    role: m.role,
    content: m.content
  }))
  recentMessages.push({ role: 'user', content: message })

  // 5. 调用 Claude API
  try {
    const reply = await callClaude(systemPrompt, recentMessages)

    // 6. 保存对话记录
    const updatedMessages = [
      ...historyMessages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
    ]

    if (chatDoc.data?.[0]) {
      await db.collection('chat_history').doc(chatDoc.data[0]._id).update({
        data: {
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
          context_summary: reply.slice(0, 50)
        }
      })
    } else {
      await db.collection('chat_history').add({
        data: {
          _openid: openid,
          session_id: sessionId,
          messages: updatedMessages,
          context_summary: reply.slice(0, 50),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    return { success: true, reply }
  } catch (err) {
    console.error('ai-coach-chat error:', err)
    return { success: false, reply: '抱歉，我遇到了一些问题。请稍后再试。' }
  }
}

function buildCoachPrompt(user, plan, context) {
  const phaseMap = { base: '基础期', build: '强化期', race: '竞赛期', taper: '比赛周' }

  return `你是 RunPilot AI 跑步教练，你在微信小程序中与跑者进行文字对话。

当前跑者信息：
- 昵称: ${user?.nickname || '跑者'}
- 年龄: ${user?.age || '--'}岁
- 跑步水平: ${user?.running_experience || '--'}
- 目标: ${user?.goal_distance || '--'}
${plan ? `- 当前计划: ${plan.plan_name} (第${plan.current_week}/${plan.total_weeks}周, ${phaseMap[plan.current_phase] || plan.current_phase})` : '- 暂无进行中的计划'}

你的能力：
1. 回答跑步相关问题（训练、营养、装备、伤病预防、比赛策略等）
2. 根据用户反馈调整训练计划
3. 提供鼓励和激励
4. 解释不同训练类型的意义

回复规则：
- 使用简体中文
- 保持回复简洁（200字以内），微信聊天格式
- 友好、鼓励的语气
- 涉及伤病时必须建议咨询医生
- 调整计划时需要用户确认`
}

async function callClaude(systemPrompt, messages) {
  const https = require('https')
  const apiKey = process.env.ANTHROPIC_API_KEY

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    }, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          resolve(json.content?.[0]?.text || '抱歉，我暂时无法回复。')
        } catch (e) {
          resolve('抱歉，我暂时无法回复。')
        }
      })
    })
    req.on('error', () => resolve('抱歉，服务暂时不可用。'))
    req.setTimeout(15000, () => { req.destroy(); resolve('抱歉，响应超时了，请稍后再试。') })
    req.write(data)
    req.end()
  })
}
