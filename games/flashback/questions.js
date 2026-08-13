"use strict";

/* Prototype case content. Keep level data here, separate from game behavior. */
window.flashbackLevels = [
  {
    title: "Detective Cafe",
    sceneImage: "../mosaic-mystery/assets/images/level-01-detective-cafe.png",
    sceneAlt: "A warmly lit detective cafe filled with evidence and investigative objects.",
    questions: [
      { prompt: "What symbol appeared on the coffee cup?", answers: ["A paw print", "A star", "A train", "A key"], correctAnswer: 0 },
      { prompt: "What was written on the notebook?", answers: ["Notes Case #47", "Platform 9", "Cabin Log", "Coffee Orders"], correctAnswer: 0 },
      { prompt: "Which object lay beside the notebook?", answers: ["A pen", "A compass", "A candle", "A ticket"], correctAnswer: 0 },
      { prompt: "What item was resting on the table near the window?", answers: ["A dark hat", "An umbrella", "A camera", "A scarf"], correctAnswer: 0 },
      { prompt: "What could be seen outside the cafe window?", answers: ["A rainy city at night", "A sunny beach", "A snowy forest", "A railway tunnel"], correctAnswer: 0 }
    ]
  },
  {
    title: "Empty Platform",
    sceneImage: "../mosaic-mystery/assets/images/level-02-empty-platform.png",
    sceneAlt: "A quiet vintage railway platform in the evening after rain.",
    questions: [
      { prompt: "Where did the scene take place?", answers: ["A railway platform", "A cafe", "A forest clearing", "A museum hall"], correctAnswer: 0 },
      { prompt: "What was the weather like?", answers: ["It had recently rained", "It was snowing", "It was bright and sunny", "A sandstorm was passing"], correctAnswer: 0 },
      { prompt: "What large object offered passengers a place to sit?", answers: ["A bench", "A sofa", "A tree stump", "A suitcase"], correctAnswer: 0 },
      { prompt: "What ran alongside the platform?", answers: ["Railway tracks", "A river", "A stone wall", "A garden path"], correctAnswer: 0 },
      { prompt: "What time of day did the scene suggest?", answers: ["Evening", "Midday", "Dawn", "Late morning"], correctAnswer: 0 }
    ]
  },
  {
    title: "Forest Cabin",
    sceneImage: "../mosaic-mystery/assets/images/level-03-forest-cabin.png",
    sceneAlt: "A secluded forest cabin at dusk with a mysterious open window.",
    questions: [
      { prompt: "Where was the cabin located?", answers: ["In a forest", "Beside a railway", "In a city square", "On a beach"], correctAnswer: 0 },
      { prompt: "What time of day did the scene suggest?", answers: ["Dusk", "Noon", "Early morning", "Bright afternoon"], correctAnswer: 0 },
      { prompt: "What object had recently gone out?", answers: ["A candle", "A fireplace", "A lantern", "A streetlamp"], correctAnswer: 0 },
      { prompt: "Which part of the cabin was open?", answers: ["A window", "The roof", "A cellar hatch", "A cupboard"], correctAnswer: 0 },
      { prompt: "What could be seen above the cabin?", answers: ["The moon", "A hot-air balloon", "A plane", "Fireworks"], correctAnswer: 0 }
    ]
  }
];
