'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * AI 计划调整云函数
 * 根据用户反馈（伤病、太累、时间不足等）调整训练计划
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { planId, adjustmentReason } = event

  try {
    const planDoc = await db.collection('training_plans').doc(planId).get()
    const plan = planDoc.data

    if (!plan) return { success: false, errMsg: '未找到训练计划' }

    // 调用 Claude API 调整计划
    const systemPrompt = `你是跑步教练 AI。当前跑者需要对训练计划进行调整。
原因：${adjustmentReason}

当前计划概要：
- 第 ${plan.current_week}/${plan.total_weeks} 周
- 阶段: ${plan.current_phase}
- 本周总跑量: ${plan.weeks?.[plan.current_week - 1]?.total_km || '--'} km

请根据调整原因，修改当前及后续周的训练内容。常见调整：
- 伤病：降低强度，增加恢复日
- 太累：减少跑量 20%，增加轻松跑比例
- 时间不足：合并训练日，保持关键训练
- 太轻松：适当增加跑量或配速目标

只输出修改后的 weeks JSON 数组（从当前周开始），不要输出其他文本。`

    const response = await callClaude(systemPrompt, adjustmentReason)

    // 解析修改后的周数据
    const adjustedWeeks = JSON.parse(extractJSON(response))

    // 更新计划
    plan.weeks.splice(plan.current_week - 1, adjustedWeeks.length, ...adjustedWeeks)
    plan.updated_at = new Date().toISOString()

    await db.collection('training_plans').doc(planId).update({
      data: {
        weeks: plan.weeks,
        updated_at: plan.updated_at
      }
    })

    return { success: true, adjustedPlan: plan }
  } catch (err) {
    console.error('ai-plan-adjust error:', err)
    return { success: false, errMsg: err.message }
  }
}

async function callClaude(systemPrompt, userMessage) {
  const https = require('https')
  const apiKey = process.env.ANTHROPIC_API_KEY

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
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
        const json = JSON.parse(body)
        resolve(json.content?.[0]?.text || '[]')
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/)
  return match ? match[0] : '[]'
}
