const OpenAI = require('openai');
const Recipe = require('../models/Recipe');
const { marked } = require('marked');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalizeText(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

exports.chatWithGPT = async (req, res) => {
  const userMessage = req.body.message;

  try {
    const intentResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Bạn là một bộ phân loại tin nhắn. Với mỗi câu đầu vào, hãy trả lời đúng 1 từ duy nhất là "greeting" nếu là lời chào hoặc "search" nếu đang tìm món ăn.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const intent = intentResponse.choices?.[0]?.message?.content?.trim().toLowerCase();
    console.log('🧠 Ý định GPT:', intent);

    if (intent === 'greeting') {
      return res.json({
        reply: marked.parse('👋 Xin chào! Tôi có thể giúp bạn tìm công thức nấu ăn. Bạn đang muốn món gì hôm nay?')
      });
    }

    const keywordResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Bạn là một trợ lý. Hãy trích từ khóa chính liên quan đến món ăn từ câu hỏi của người dùng, chỉ trả về 1 đến 3 từ khóa đơn giản, cách nhau bởi dấu phẩy.'
        },
        {
          role: 'user',
          content: `Câu hỏi: "${userMessage}"`
        }
      ]
    });

    const keywordRaw = keywordResponse.choices[0].message.content || '';
    const keywordList = keywordRaw.split(',').map(k => normalizeText(k.trim())).filter(Boolean);
    console.log('🧠 GPT trích từ khóa:', keywordList);

    const relatedRecipes = await Recipe.find({}).lean();

    const matchedRecipes = relatedRecipes.filter(recipe => {
      const name = normalizeText(recipe.name || '');
      const desc = normalizeText(recipe.description || '');
      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map(i => normalizeText(i)).join(' ')
        : '';
      const fullText = `${name} ${desc} ${ingredients}`;
      return keywordList.some(word => fullText.includes(word));
    });

    const recipeContext = matchedRecipes.length > 0
      ? matchedRecipes.map((r) =>
          `• ${r.name}: ${r.description.substring(0, 100)}...\n👉 [**${r.name}**](localhost:4000/recipe/${r._id})`
        ).join('\n')
      : 'Không có công thức nào phù hợp được tìm thấy trong hệ thống.';

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Bạn là trợ lý nấu ăn thân thiện. Dựa trên danh sách món ăn bên dưới, hãy gợi ý một món phù hợp cho người dùng. ❗Lưu ý: KHÔNG tạo thêm link — chỉ dùng link đã có sẵn trong danh sách và viết dưới dạng markdown.'
        },
        {
          role: 'user',
          content: `Câu hỏi: "${userMessage}"\n\nDanh sách món ăn từ hệ thống:\n${recipeContext}`
        }
      ]
    });

    const replyMarkdown = chatResponse.choices?.[0]?.message?.content || 'Xin lỗi, tôi chưa có câu trả lời phù hợp.';

    const recipeLinks = matchedRecipes.map(r => ({
      name: r.name,
      link: `localhost:4000/recipe/${r._id}`
    }));

    let finalReply = replyMarkdown;

    recipeLinks.forEach(recipe => {
      const pattern = new RegExp(`\\b${recipe.name}\\b`, 'gi');
      const markdownLink = `[**${recipe.name}**](${recipe.link})`;
      finalReply = finalReply.replace(pattern, markdownLink);
    });

    const replyHtml = marked.parse(finalReply);
    res.json({ reply: replyHtml });

  } catch (error) {
    console.error('🔥 ChatGPT Error:', error);
    res.status(500).json({
      reply: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};
