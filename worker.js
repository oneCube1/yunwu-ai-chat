// AI服务配置
const API_KEY = "sk-xJjjWTrYglQvXgWaXXusT3ZVPkPqHmeNmAYT648Ss7GVmNNo"; 
const API_URL = "https://yunwu.ai/v1/chat/completions";

// 添加更多请求头，使请求看起来更像正常浏览器请求
const requestHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`,
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "X-Custom-Header": "personal-ai-assistant"
};

// 处理跨域请求的headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// 处理OPTIONS请求（预检请求）
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

// 主要处理函数
async function handleRequest(request) {
  // 处理跨域预检请求
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }

  // 验证请求方法
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "只支持POST请求" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }

  try {
    // 解析请求体
    const requestData = await request.json();
    const userQuestion = requestData.question;

    if (!userQuestion) {
      return new Response(
        JSON.stringify({ error: "请提供问题内容" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // 添加提示语，告知AI这是通过个人助手提问的
    const enhancedQuestion = `以下是通过个人智能助手应用提出的问题:\n\n${userQuestion}`;

    // 准备发送到AI服务的请求
    const aiRequestData = {
      model: "claude-3-5-sonnet-20240620",
      messages: [{ role: "user", content: enhancedQuestion }],
      temperature: 0.7,
    };

    // 发送请求到AI服务
    const aiResponse = await fetch(API_URL, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(aiRequestData),
    });

    // 解析AI服务的响应
    const aiData = await aiResponse.json();

    // 检查是否成功并提取回复内容
    if (aiResponse.status === 200 && aiData.choices && aiData.choices.length > 0) {
      const assistantMessage = aiData.choices[0].message.content;
      
      // 返回结果给前端
      return new Response(
        JSON.stringify({ answer: assistantMessage }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else {
      // 处理API错误
      return new Response(
        JSON.stringify({ 
          error: "AI服务返回错误", 
          details: aiData 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    // 处理代码异常
    return new Response(
      JSON.stringify({ 
        error: "处理请求时发生错误", 
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}

// 导出默认的fetch处理函数
export default {
  async fetch(request, env, ctx) {
    // 检查请求路径
    const url = new URL(request.url);
    
    // 只处理API路径的请求
    if (url.pathname === "/api/chat") {
      return handleRequest(request);
    }
    
    // 其他路径返回404
    return new Response(
      JSON.stringify({ error: "Not Found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  },
}; 