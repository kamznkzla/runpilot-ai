'use strict'
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

/**
 * AI 训练计划生成云函数
 * 调用 Claude API 根据用户数据生成个性化训练计划
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const {
    goalDistance,
    goalTimeSec,
    goalRaceDate,
    weeksCount = 12,
    experienceLevel = 'beginner',
    weeklyDays = '4-5',
    userProfile = {}
  } = event

  // 构建系统提示词
  const systemPrompt = buildSystemPrompt({
    userProfile, goalDistance, goalTimeSec, goalRaceDate,
    weeksCount, experienceLevel, weeklyDays
  })

  try {
    const response = await callClaudeAPI(systemPrompt)

    // 解析 AI 返回的 JSON 训练计划
    const plan = JSON.parse(extractJSON(response))

    // 补充元数据
    plan.status = 'active'
    plan._openid = openid
    plan.start_date = plan.start_date || new Date().toISOString().split('T')[0]
    plan.current_week = 1
    plan.current_phase = plan.phases?.[0]?.name || 'base'
    plan.created_at = new Date().toISOString()
    plan.updated_at = new Date().toISOString()

    // 存储到数据库
    const result = await db.collection('training_plans').add({ data: plan })

    return {
      success: true,
      plan: { ...plan, _id: result._id }
    }
  } catch (err) {
    console.error('ai-generate-plan error:', err)
    return {
      success: false,
      errMsg: err.message || '计划生成失败'
    }
  }
}

function buildSystemPrompt(params) {
  const { userProfile, goalDistance, goalTimeSec, goalRaceDate, weeksCount, experienceLevel, weeklyDays } = params
  const distMap = { '5k': '5公里', '10k': '10公里', half_marathon: '半程马拉松(21.0975km)', marathon: '全程马拉松(42.195km)' }
  const expMap = { beginner: '新手(跑龄<6个月)', intermediate: '进阶(有规律跑步,完成过10K)', advanced: '高阶(跑龄>2年,完成过半马/全马)' }

  const goalTimeStr = goalTimeSec ? `${Math.floor(goalTimeSec / 3600)}时${Math.floor((goalTimeSec % 3600) / 60)}分` : '完赛即可'

  return `你是 RunPilot 的专业跑步教练 AI。请根据以下用户信息生成一份科学、个性化的周训练计划。

用户信息：
- 年龄: ${userProfile.age || '未知'}, 性别: ${userProfile.gender || '未知'}
- 身高: ${userProfile.height_cm || '--'}cm, 体重: ${userProfile.weight_kg || '--'}kg
- 跑步水平: ${expMap[experienceLevel] || experienceLevel}
- 每周可训练: ${weeklyDays}天

目标：
- 距离: ${distMap[goalDistance] || goalDistance}
- 目标时间: ${goalTimeStr}
- 比赛日期: ${goalRaceDate || '未设定'}
- 计划时长: ${weeksCount}周

训练原则：
- 80/20强度分配（80%轻松跑，20%强度训练）
- 每周最多2次高强度训练
- 高强度训练之间至少间隔1天
- 长距离跑安排在周六
- 每4周安排一个恢复周（跑量减少20%）
- 周一和周五建议安排休息或轻松恢复

请输出严格的 JSON 格式（不要包含任何其他文本），结构如下：
{
  "plan_name": "训练计划名称(中文)",
  "goal_distance": "${goalDistance}",
  "goal_time_sec": ${goalTimeSec || 0},
  "race_date": "${goalRaceDate || ''}",
  "total_weeks": ${weeksCount},
  "start_date": "YYYY-MM-DD(从今天开始的下一个周一)",
  "phases": [
    { "name": "base", "start_week": 1, "end_week": ${Math.ceil(weeksCount * 0.3)}, "focus": "aerobic_base" },
    { "name": "build", "start_week": ${Math.ceil(weeksCount * 0.3) + 1}, "end_week": ${Math.ceil(weeksCount * 0.65)}, "focus": "threshold_lactate" },
    { "name": "race", "start_week": ${Math.ceil(weeksCount * 0.65) + 1}, "end_week": ${weeksCount - 1}, "focus": "race_specific" },
    { "name": "taper", "start_week": ${weeksCount}, "end_week": ${weeksCount}, "focus": "peak_performance" }
  ],
  "weeks": [
    {
      "week_number": 1,
      "phase": "base",
      "total_km": 数字,
      "days": [
        { "day": "monday", "type": "rest|easy|tempo|interval|long|recovery", "distance_km": 数字, "target_pace_sec_per_km": 秒数, "duration_min": 分钟, "rpe_target": 1-10, "description": "中文描述", "coach_note": "简短的中文教练提示" }
      ]
    }
  ]
}

配速参考(秒/公里): 轻松跑320-370, 节奏跑280-310, 间歇跑240-270, LSD长距离330-360, 恢复跑350-380`
}

async function callClaudeAPI(systemPrompt) {
  const https = require('https')
  const apiKey = process.env.ANTHROPIC_API_KEY

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: '请生成训练计划' }]
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
          resolve(json.content?.[0]?.text || '')
        } catch (e) {
          reject(new Error('Invalid API response'))
        }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('无法解析AI返回的训练计划')
  return match[0]
}
