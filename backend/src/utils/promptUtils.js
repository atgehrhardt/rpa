const prompts = require('prompts');

async function createPrompt(fields) {
  const questions = fields.map(field => {
    const baseQuestion = {
      name: field.name,
      type: field.type === 'longAnswer' ? 'text' : 'text',
      message: field.label,
    };

    switch (field.type) {
      case 'shortAnswer':
        return baseQuestion;
      case 'password':
        return { ...baseQuestion, style: 'password' };
      case 'email':
        return { ...baseQuestion, validate: value => /\S+@\S+\.\S+/.test(value) || 'Invalid email address' };
      case 'longAnswer':
        return { ...baseQuestion, multiline: true };
      default:
        return baseQuestion;
    }
  });

  return await prompts(questions);
}

module.exports = { createPrompt };