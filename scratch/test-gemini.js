const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const modelsToTest = ["gemini-pro", "gemini-1.5-pro", "gemini-1.0-pro"];

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = "hello";
      const result = await model.generateContent(prompt);
      console.log(`Success with ${modelName}`);
    } catch (e) {
      console.error(`Error with ${modelName}:`, e.message);
    }
  }
}

run();
