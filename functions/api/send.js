export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    const { name, age, email, tel, artist, placement, size, datetime, concept } = body;
    
    // Validate inputs
    if (!name || !age || !email || !artist || !placement || !size || !datetime || !concept) {
      return new Response(JSON.stringify({ error: "必須項目が不足しています。" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resendApiKey = env.RESEND_API_KEY;
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY 環境変数が設定されていません。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build the email HTML layout
    const emailHtml = `
      <h3>ご予約・お問い合せフォームより新しいメッセージを受信しました。</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: sans-serif;">
        <tr style="background-color: #f8f8f8;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left; width: 150px;">項目</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">内容</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">お名前</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${name}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">年齢</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${age}歳</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">メールアドレス</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${email}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">電話番号</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${tel || "未記入"}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">希望アーティスト</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${artist}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">希望部位</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${placement}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">希望サイズ</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${size}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">希望日時</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${datetime}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">タトゥーへの想い</td>
          <td style="border: 1px solid #ddd; padding: 10px; white-space: pre-wrap;">${concept}</td>
        </tr>
      </table>
    `;

    // Call Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "AINO creator <contact@send.ainocreator.jp>",
        to: ["hello@ainocreator.jp"],
        reply_to: email,
        subject: `【ご予約・お問い合せ】${name}様より`,
        html: emailHtml
      })
    });

    const resData = await res.json();
    if (res.ok) {
      return new Response(JSON.stringify({ success: true, id: resData.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: resData.message || "Resend API での送信に失敗しました。" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
