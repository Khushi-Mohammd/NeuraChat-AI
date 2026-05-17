import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options,
    );

    const data = await response.json();

    // DEBUG LOG
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    // HANDLE API ERRORS
    if (data.error) {
      console.log("OPENAI API ERROR:", data.error.message);
      return "OpenAI API Error";
    }

    // HANDLE EMPTY RESPONSES
    if (!data.choices || data.choices.length === 0) {
      console.log("No choices returned");
      return "No response generated";
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.log("FETCH ERROR:", error);
    return "Server Error";
  }
};

export default getOpenAIAPIResponse;
