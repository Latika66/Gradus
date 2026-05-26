const key = process.env.GEMINI_API_KEY;

async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log("Error fetching models:", data);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
