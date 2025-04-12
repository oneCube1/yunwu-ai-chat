// 云雾AI API配置
const API_KEY = "sk-xJjjWTrYglQvXgWaXXusT3ZVPkPqHmeNmAYT648Ss7GVmNNo"; // 您的API密钥
const API_URL = "https://yunwu.ai/v1/chat/completions";

// 处理跨域请求的headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 允许任何来源访问，生产环境中应限制为特定域名
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

    // 准备发送到云雾AI的请求
    const yunwuRequestData = {
      model: "claude-3-5-sonnet-20240620",
      messages: [{ role: "user", content: userQuestion }],
      temperature: 0.7,
    };

    // 发送请求到云雾AI
    const yunwuResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(yunwuRequestData),
    });

    // 解析云雾AI的响应
    const yunwuData = await yunwuResponse.json();

    // 检查是否成功并提取回复内容
    if (yunwuResponse.status === 200 && yunwuData.choices && yunwuData.choices.length > 0) {
      const assistantMessage = yunwuData.choices[0].message.content;
      
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
          details: yunwuData 
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