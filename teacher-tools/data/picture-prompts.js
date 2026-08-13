/*
  Built-in Picture Prompt manifest.
  Put sequentially numbered Screenshot_N.jpg files in ../picture-prompts/images/.
  Increase PICTURE_PROMPT_SCREENSHOT_COUNT when another image is added.
  Add its number to PICTURE_PROMPT_FEELINGS_QUESTIONS when it should show the
  optional feelings discussion question.
*/
const PICTURE_PROMPT_SCREENSHOT_COUNT = 4;
const PICTURE_PROMPT_FEELINGS_QUESTIONS = new Set([]);

globalThis.INKY_PAWS_PICTURE_PROMPTS = Array.from(
  { length: PICTURE_PROMPT_SCREENSHOT_COUNT },
  (_, index) => {
    const number = index + 1;
    return {
      file: `Screenshot_${number}.jpg`,
      feelingsQuestion: PICTURE_PROMPT_FEELINGS_QUESTIONS.has(number)
    };
  }
);
