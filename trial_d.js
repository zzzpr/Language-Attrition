//Setting the port number for communicating with the server/
var my_port_number = "/ws9/";

// Allocate participant id
var participant_id;
var participant_training_condition;

var jsPsych = initJsPsych({
    on_finish: function() {
        window.location = "https://app.prolific.co/submissions/complete?cc=XXXXXX"
    }
});
var get_participant_id = {
    type: jsPsychCallFunction,
    async: true,
    func: function (done) {
        fetch("participant_id_allocator.php")
            .then(function (response) {return response.text();})
            .then(function (response_text) {return parseInt(response_text);})
            .then(function (result) {
                participant_id = result;
                // condition number is the remainder of participant_id divided by 2
                condition_number = participant_id % 2;
                if (condition_number==0) {
                  participant_training_condition='condition1';
                  }
                else {
                  participant_training_condition='condition2';}
                console.log(participant_id)
                console.log(participant_training_condition)
                jsPsych.data.addProperties({condition: condition_number});
            })            .then(done())
    }
}

//This will retrive their prolific ID from the URL 
//see explanation at https://kennysmithed.github.io/oels2024/oels_wk10.html in section "Linking participants to their data"
//you could add this to the data in the same way as you do for the participant_id variable
//which would be useful if you need to figure out which person on prolific generated some data file
var prolific_id = jsPsych.data.getURLVariable("PROLIFIC_PID");

// consent screen
var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Welcome!</h2>
    <div style="text-align: left; margin: auto;">
    <p>This is an experiment about learning a new language and communicate with a partner. It will take up to 40 minutes to complete and you will be paid £8 for your time.</p>
    <p>If you choose to withdraw from the study at any point, you will still receive partial compensation based on the phases you completed and the time you spent.</p>
    <p>It is being conducted by Zhang at the xxx, and has been granted ethic approval.</p>
    <p>Please <a href="xxx.pdf" target="_blank">click here</a> to read an information letter (pdf) about the study.</p>
    <p>Clicking on the <strong>agree</strong> button below indicates that:</p>
    <ul>
      <li>You are a native speaker of English, at least 18 years old.</li>
      <li>You have read the information sheet.</li>
      <li>You voluntarily agree to participate, and understand you can stop your participation at any time.</li>
      <li>You agree that your anonymous data may be kept permanently in Edinburgh University archives and may be used by qualified researchers for teaching and research purposes.</li>
    </ul>
    <p>If you do not agree to all of these, please close this window in your browser now.</p>
  `,
  choices: ['Agree']
};

var wait_for_parameters_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p>Retrieving experiment parameters, please wait.</p>
  `,
  choices: [],
  trial_duration:3000
};

// Saving data trial by trial
function save_data(name, data_in) {
  var url = "save_data.php";
  var data_to_send = { filename: name, filedata: data_in };
  fetch(url, {
    method: "POST",
    body: JSON.stringify(data_to_send),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
}

var write_headers = {
  type: jsPsychCallFunction,
  func: function () {
    var this_participant_filename = "di_" + participant_id + ".csv";
    save_data(
      this_participant_filename,
      "prolific_id, participant_id,trained_condition,trial_index,exp_trial_type,time_elapsed,\
partner_id,context_sentence, context_image, target_sentence_or_directors_choice, target_image, whole_image,\
button_selected,correct_or_not,score,rt\n"
    );
  },
};


function save_dyadic_interaction_data(data) {
  if (data.block == "production"){
  var data_to_save = [
      prolific_id,
      participant_id,
      participant_training_condition,
      data.trial_index,
      "noun/verb_production",
      data.time_elapsed,
      "NA",
      "NA",
      "NA",
      "NA",
      data.object,
      "NA",
      data.label_selected,
      data.correct_or_not,
      data.score,
      data.rt
  ];
}
 else if (data.block == "comprehension"){
    var data_to_save = [
      prolific_id,
      participant_id,
      participant_training_condition,
      data.trial_index,
      "noun/verb_comprehension",
      data.time_elapsed,
      "NA",
      "NA",
      "NA",
      data.target_label,
      "NA",
      "NA",
      data.image_selected,
      data.correct_or_not,
      data.score,
      data.rt
    ];
}
  else if (data.block == "sentence_production"){
    var data_to_save = [
      prolific_id,
      participant_id,
      participant_training_condition,
      data.trial_index,
      data.block,
      data.time_elapsed,
      "NA",
      data.context_sentence,
      data.context_image,
      data.target_image,
      data.label_selected,
      data.whole_image,
      "NA",
      "NA",
      "NA",
      data.rt
];
}

else if (data.block == "sentence_comprehension"){
  var data_to_save = [
    prolific_id,
    participant_id,
    participant_training_condition,
    data.trial_index,
    data.block,
    data.time_elapsed,
    "NA",
    data.context_sentence,
    data.context_image,
    data.target_sentence,
    "NA",
    data.whole_image,
    data.iamge_selected,
    "NA",
    "NA",
    data.rt,
];
}

else if (data.block == "director"){
  var data_to_save = [
    prolific_id,
    participant_id,
    participant_training_condition,
    data.trial_index,
    data.block,
    data.time_elapsed,
    data.partner_id,
    data.context_sentence,
    data.context_image,
    "NA",
    data.target_image,
    data.whole_image,
    data.button_selected,
    "NA",
    "NA",
    data.rt,
];
}

else if (data.block == "matcher"){
  var data_to_save = [
    prolific_id,
    participant_id,
    participant_training_condition,
    data.trial_index,
    data.block,
    data.time_elapsed,
    data.partner_id,
    data.context_sentence,
    data.context_image,
    data.target_sentence, 
    data.target_image,
    data.whole_image,
    data.image_selected,
    "NA",
    "NA",
    data.rt,
];
}

else if (data.block == "interaction_feedback") {
  var data_to_save = [
    prolific_id,
    participant_id,
    participant_training_condition,
    data.trial_index,
    data.block,
    data.time_elapsed,
    data.partner_id,
    "NA",
    "NA",
    "NA",
    "NA",
    "NA",
    "NA",
    data.correct_or_not,
    "NA",
    "NA"
  ]  
}

  // join these with commas and add a newline
  var line = data_to_save.join(",") + "\n";
  var this_participant_filename = "di_" + participant_id + ".csv";
  save_data(this_participant_filename, line);
}


// noun learning trial
var noun_label = ["pilka", "barsa"];

// Instruction page_1 training
var training_instruction_1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:"<h3>Part 1: Noun Training Phase</h3> \
    <p style='text-align:left'>You are eventually going to learn how to describe sequences of events,</p>\
    <p style='text-align:left'> but we will start by training you on some basic vocabulary, including the words for describing the characters and actions in those events. </p> \
    <p style='text-align:left'>In this part, you will see two cartoon characters along with their names.</p> \
    <p style='text-align:left'><b>Please pay close attention and try to remember both the names and the images.</b> You will be tested in the following sections. </p>",
  choices: ["Start"],
};

// 1. observation phase
function make_observation_trial(object, label) {
  var object_filename = "attrition_images/" + object + ".jpg"; //build file name for the object
  trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    choices: [],
    timeline: [
      {
        prompt: "&nbsp;", //dummy text
        trial_duration: 500,
      },
      { prompt: label, 
        trial_duration: 3000, 
        data: { block: "observation" } },
    ],
  };
  return trial;
};

var observation_trial_pilka = make_observation_trial("artist", "pilka");
var observation_trial_barsa = make_observation_trial("pirate", "barsa");

var noun_observation_trials = [
  observation_trial_pilka,
  observation_trial_barsa,
  observation_trial_pilka,
  observation_trial_barsa,
  observation_trial_pilka,
  observation_trial_barsa
];

//2. production task

// Instruction page_2 Tests
var test_instruction_1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:"<h3>Part 2: Noun Test Phase</h3> \
    <p style='text-align:left'>OK, now to test you on those words!</p> \
    <p style='text-align:left'>In each question, you'll either see one character and have to choose the correct name,</p> \
    <p style='text-align:left'>or see a name and have to choose the correct character it refers to.</p> \
    <p style='text-align:left'>Every time you answer correctly, you get 10 points. Feedback and your current score will be shown after each question.</p> \
    <p style='text-align:left'><b>You have to do well on this test to proceed to the next stage in the experiment.</b> </p>",
  choices: ["Start"],
};

var score = 0;

const label_to_object = {
  barsa: "pirate",
  pilka: "artist",
  somo : "sing",
  leno : "sleep",
  riko : "run",
  jato : "jump"
};

var image_to_label_map = {
  "sing": "somo",
  "run": "riko",
  "sleep": "leno",
  "jump": "jato",
  "pirate": "barsa",
  "artist": "pilka"
};

function make_production_trial(object, labels, correct_label) {
  var object_filename_array = [].concat(labels);
  var shuffled_labels = jsPsych.randomization.shuffle(object_filename_array);
  var target_position = shuffled_labels.indexOf(correct_label);
  var image_paths = shuffled_labels.map(label => "attrition_images/" + label + ".jpg");

  var trial_selection = {
    type: jsPsychImageButtonResponse,
    stimulus: "attrition_images/" + object + ".jpg",
    choices: shuffled_labels,
    data: {
      block: "production",
      object: object
    },
    save_trial_parameters: { choices: true },
    on_finish: function (data) {
      var button_number = data.response;
      data.label_selected = data.choices[button_number];

      if (data.label_selected === correct_label) {
        data.correct_or_not = 1;
        score += 10;
      } else {
        data.correct_or_not = 0;
      }

      data.score = score;
      save_dyadic_interaction_data(data);
    }
  };

  var trial_feedback = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      var last_data = jsPsych.data.get().last(1).values()[0];
      return `
        <img src="attrition_images/${last_data.object}.jpg" width="200px" style="display:block; margin: 0 auto 20px auto;">
        ${
          last_data.correct_or_not === 1
            ? `<p><audio autoplay><source src="_correct.mp3" type="audio/mpeg"></audio><em>Correct! Your current score is ${score}.</em></p>`
            : `<p><audio autoplay><source src="_incorrect.mp3" type="audio/mpeg"></audio><em>Incorrect. The correct answer was <strong>${correct_label}</strong>.</em></p>`
        }
      `;
    },
    choices: shuffled_labels,
    response_ends_trial: false,
    trial_duration: 1500,
    post_trial_gap: 500,
    button_html: function () {
      var last_data = jsPsych.data.get().last(1).values()[0];
      var last_position_selected = last_data.response;
      var html_array = [];
      for (var i = 0; i < shuffled_labels.length; i++) {
        var border = "2px solid white";
        if (i == target_position) {
          border = "2px solid green";
        } else if (i == last_position_selected && last_data.correct_or_not === 0) {
          border = "2px solid red";
        }
        html_array.push(
          `<button class="jspsych-btn" disabled="true" style="border:${border}; ">${shuffled_labels[i]}</button>`
        );
      }
      return html_array;
    }
  };

  return { timeline: [trial_selection, trial_feedback] };
}



var production_trial_pilka = make_production_trial("artist", noun_label, "pilka");
var production_trial_barsa = make_production_trial("pirate", noun_label, "barsa");


function make_comprehension_trial(target_label, image_options, correct_image) {
  var feedback_text = "";
  var last_selected_index = -1;
  var shuffled_images = [];

  var trial = {
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<p>Which one is <strong>" + target_label + "</strong>?</p>",
        choices: [],
        button_html: "<button class='jspsych-btn'><img src='attrition_images/%choice%.jpg' width='150' style='border:4px solid white'></button>",
        data: {
          block: "comprehension",
          target_label,
        },
        save_trial_parameters: { choices: true },
        on_start: function (trial) {
          shuffled_images = jsPsych.randomization.shuffle(image_options);
          trial.choices = shuffled_images;
          trial.correct_image_index = shuffled_images.indexOf(correct_image);
          trial.data.correct_image_index = trial.correct_image_index;
          trial.data.shuffled_images = shuffled_images;
        },
   on_finish: function (data) {
  var selected_index = data.response;
  last_selected_index = selected_index;
  var selected_image = data.choices[selected_index];
  data.image_selected = selected_image;

  var selected_label = image_to_label_map[selected_image];
  var correct_label = image_to_label_map[correct_image];
  var correct_index = data.correct_image_index;

  if (selected_index === correct_index) {
    score += 10;
    data.correct_or_not = 1;
    feedback_text = `<p><audio autoplay><source src='_correct.mp3' type='audio/mpeg'></audio>
      <em>Correct! Your current score is ${score}.</em></p>`;
  } else {
    data.correct_or_not = 0;
    feedback_text = `<p><audio autoplay><source src='_incorrect.mp3' type='audio/mpeg'></audio>
      <em>Incorrect. You selected <strong>${selected_label}</strong>, but <strong>${correct_label}</strong> is in image ${correct_index + 1}.</em></p>`;
  }

  data.score = score;
  save_dyadic_interaction_data(data);
}
      },
  {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        var last_data = jsPsych.data.get().last(1).values()[0];
        var correct_index = last_data.correct_image_index;
        var selected_index = last_data.response;
        var score = last_data.score;

        var html_array = [];
        for (var i = 0; i < last_data.shuffled_images.length; i++) {
          var border = "4px solid white";
          if (i == correct_index) {
            border = "4px solid green";
          }
          if (i == selected_index && selected_index !== correct_index) {
            border = "4px solid red";
          }
          html_array.push(
            `<button class="jspsych-btn" disabled="true" style="margin: 5px;">
              <img src="attrition_images/${last_data.shuffled_images[i]}.jpg" width="150" style="border:${border}">
            </button>`
          );
        }

        return feedback_text + html_array.join("");
      },
      choices: "NO_KEYS",
      trial_duration: 1500,
      post_trial_gap: 500
    }
  ]
};

return trial;
}

var comprehension_trial_pilka = make_comprehension_trial("pilka", ["artist", "pirate"], "artist");
var comprehension_trial_barsa = make_comprehension_trial("barsa", ["artist", "pirate"], "pirate");

var noun_test_trials = jsPsych.randomization.repeat(
  [comprehension_trial_pilka, comprehension_trial_barsa, production_trial_barsa, production_trial_pilka],
  [2, 2, 2, 2]
);

// verb learning trial
var verb_label = ["somo", "riko", "jato", "leno"];
var verb_images = ["sleep", "run", "jump", "sing"];
// Instruction page_1 training
var training_instruction_2 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:"<h3>Part 3: Verb Training Phase</h3> \
    <p style='text-align:left'>In this part, you will see the characters performing the same actions. Each action will be shown along with its corresponding verb.</p> \
    <p style='text-align:left'><b>Please pay close attention and try to remember each verb and the action it represents.</b></p> \
    <p style='text-align:left'>You will also be tested in the following sections.</p>",
  choices: ["Start"],
};

// 1. observation phase

var observation_trial_somo = make_observation_trial("sing", "somo");
var observation_trial_riko = make_observation_trial("run", "riko");
var observation_trial_jato = make_observation_trial("jump", "jato");
var observation_trial_leno = make_observation_trial("sleep", "leno");

var verb_observation_trials = jsPsych.randomization.shuffle([
  observation_trial_somo,
  observation_trial_somo,
  observation_trial_somo,
  observation_trial_riko,
  observation_trial_riko,
  observation_trial_riko,
  observation_trial_jato,
  observation_trial_jato,
  observation_trial_jato,
  observation_trial_leno,
  observation_trial_leno,
  observation_trial_leno
]);

//tasks
var test_instruction_2 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:"<h3>Part 4: Verb Test Phase</h3> \
    <p style='text-align:left'>OK, now for a test on the verbs.</p> \
    <p style='text-align:left'>You will either see the four images and have to choose the correct verb, or see a verb and have to choose the correct image.</p> \
    <p style='text-align:left'>Every time you answer correctly, you get 10 points. Feedback and your current score will be shown after each question.</p> \
    <p style='text-align:left'><b>You have to do well on this test to proceed to the next stage in the experiment.</b> </p>",
  choices: ["Start"],
};

var production_trial_leno = make_production_trial("sleep", verb_label, "leno");
var production_trial_somo = make_production_trial("sing", verb_label, "somo");
var production_trial_jato = make_production_trial("jump", verb_label, "jato");
var production_trial_riko = make_production_trial("run", verb_label, "riko");
var comprehension_trial_leno = make_comprehension_trial("leno", verb_images, "sleep");
var comprehension_trial_somo = make_comprehension_trial("somo", verb_images, "sing");
var comprehension_trial_jato = make_comprehension_trial("jato", verb_images, "jump");
var comprehension_trial_riko = make_comprehension_trial("riko", verb_images, "run");


var verb_test_trials = jsPsych.randomization.repeat(
  [production_trial_leno, production_trial_somo,  production_trial_jato, production_trial_riko, comprehension_trial_leno, comprehension_trial_somo, comprehension_trial_jato, comprehension_trial_riko],
  [2, 2, 2, 2, 2, 2, 2, 2]
);


var training_score_exclusion = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
    "<p style='text-align:left'>Thanks for your participation! Sorry that you are not qualified to participate in the rest parts. You will be compensated ￡1 for your time. </p>",
    choices: [],
}

var training_score_check = {
    timeline: [training_score_exclusion],
    conditional_function: function () {
      // get the data from the last trial
      //retrieve their answer to the question - this will be Yes or No
      var whole_score = score;
      if (whole_score < 180) {
        //this means we *will* run the conditional timeline
        return true;
      } else {
        //this means we will not
        return false;
      }
    },
  };
  
// sentence
// 1. observation trial
  var trial_n_obs = 1;
  var max_trial_n_obs = 40;
function make_observation_trial_sentence(context_image, context_sentence, target_image, target_sentence, image) {
  var object_filename_1 = "attrition_images/" + context_image + ".jpg"; //build file name for the object
  var object_filename_2 = "attrition_images/" + target_image + ".jpg";
  var fixation = "attrition_images/fixation.png";
  var whole_image = "attrition_images/" + image + ".png";
  trial = {
    type: jsPsychImageButtonResponsePromptAboveImage,
    choices: [],
    timeline: [
      {
        stimulus: whole_image,
        prompt1: function() {
          return "<p><em>Sequence <strong>" + trial_n_obs + "</strong> of " + max_trial_n_obs + "</em></p>" }, 
        prompt2: "&nbsp;",
        trial_duration: 5000,
        stimulus_style: "height: 60vh; width: auto; display: block; margin: 20 auto;"
      },
      {
        stimulus: fixation,
        prompt: "&nbsp;", //dummy text
        trial_duration: 1000,
        on_start: function () {
          trial_n_obs += 1;}
      }
    ],
  };
  return trial;
};

var supportive_null_sentence_trials = [
  make_observation_trial_sentence( "artist_sing", "Somo pilka",   "artist_run", "Riko", "001"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka",  "artist_jump", "Jato", "002"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka", "artist_sleep", "Leno", "003"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "artist_sing", "Somo", "004"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "artist_jump", "Jato", "005"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka", "artist_sleep", "Leno", "006"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",  "artist_sing", "Somo", "007"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",   "artist_run", "Riko", "008"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka", "artist_sleep", "Leno", "009"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "artist_sing", "Somo", "010"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",   "artist_run", "Riko", "011"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "artist_jump", "Jato", "012"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",   "pirate_run", "Riko", "013"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",  "pirate_jump", "Jato", "014"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa", "pirate_sleep", "Leno", "015"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "pirate_sing", "Somo", "016"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "pirate_jump", "Jato", "017"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa", "pirate_sleep", "Leno", "018"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",  "pirate_sing", "Somo", "019"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",   "pirate_run", "Riko", "020"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa", "pirate_sleep", "Leno", "021"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "pirate_sing", "Somo", "022"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",   "pirate_run", "Riko", "023"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "pirate_jump", "Jato", "024")
];

var supportive_overt_sentence_trials = [
  make_observation_trial_sentence( "artist_sing", "Somo pilka",   "artist_run", "Riko pilka", "025"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka",  "artist_jump", "Jato pilka", "026"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka", "artist_sleep", "Leno pilka", "027"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "artist_sing", "Somo pilka", "028"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "artist_jump", "Jato pilka", "029"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka", "artist_sleep", "Leno pilka", "030"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",  "artist_sing", "Somo pilka", "031"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",   "artist_run", "Riko pilka", "032"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka", "artist_sleep", "Leno pilka", "033"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "artist_sing", "Somo pilka", "034"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",   "artist_run", "Riko pilka", "035"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "artist_jump", "Jato pilka", "036"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",   "pirate_run", "Riko barsa", "037"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",  "pirate_jump", "Jato barsa", "038"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa", "pirate_sleep", "Leno barsa", "039"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "pirate_sing", "Somo barsa", "040"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "pirate_jump", "Jato barsa", "041"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa", "pirate_sleep", "Leno barsa", "042"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",  "pirate_sing", "Somo barsa", "043"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",   "pirate_run", "Riko barsa", "044"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa", "pirate_sleep", "Leno barsa", "045"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "pirate_sing", "Somo barsa", "046"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",   "pirate_run", "Riko barsa", "047"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "pirate_jump", "Jato barsa", "048")
];


var non_supportive_null_sentence_trials = [
  make_observation_trial_sentence( "artist_sing", "Somo pilka",   "pirate_run", "Riko", "049"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka",  "pirate_jump", "Jato", "050"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka", "pirate_sleep", "Leno", "051"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "pirate_sing", "Somo", "052"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "pirate_jump", "Jato", "053"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka", "pirate_sleep", "Leno", "054"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",  "pirate_sing", "Somo", "055"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",   "pirate_run", "Riko", "056"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka", "pirate_sleep", "Leno", "057"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "pirate_sing", "Somo", "058"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",   "pirate_run", "Riko", "059"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "pirate_jump", "Jato", "060"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",   "artist_run", "Riko", "061"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",  "artist_jump", "Jato", "062"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa", "artist_sleep", "Leno", "063"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "artist_sing", "Somo", "064"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "artist_jump", "Jato", "065"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa", "artist_sleep", "Leno", "066"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",  "artist_sing", "Somo", "067"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",   "artist_run", "Riko", "068"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa", "artist_sleep", "Leno", "069"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "artist_sing", "Somo", "070"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",   "artist_run", "Riko", "071"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "artist_jump", "Jato", "072"),
];

var non_supportive_overt_sentence_trials = [
  make_observation_trial_sentence( "artist_sing", "Somo pilka",   "pirate_run", "Riko barsa", "073"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka",  "pirate_jump", "Jato barsa", "074"),
  make_observation_trial_sentence( "artist_sing", "Somo pilka", "pirate_sleep", "Leno barsa", "075"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "pirate_sing", "Somo barsa", "076"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka",  "pirate_jump", "Jato barsa", "077"),
  make_observation_trial_sentence(  "artist_run", "Riko pilka", "pirate_sleep", "Leno barsa", "078"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",  "pirate_sing", "Somo barsa", "079"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka",   "pirate_run", "Riko barsa", "080"),
  make_observation_trial_sentence( "artist_jump", "Jato pilka", "pirate_sleep", "Leno barsa", "081"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "pirate_sing", "Somo barsa", "082"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",   "pirate_run", "Riko barsa", "083"),
  make_observation_trial_sentence("artist_sleep", "Leno pilka",  "pirate_jump", "Jato barsa", "084"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",   "artist_run", "Riko pilka", "085"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa",  "artist_jump", "Jato pilka", "086"),
  make_observation_trial_sentence( "pirate_sing", "Somo barsa", "artist_sleep", "Leno pilka", "087"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "artist_sing", "Somo pilka", "088"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa",  "artist_jump", "Jato pilka", "089"),
  make_observation_trial_sentence(  "pirate_run", "Riko barsa", "artist_sleep", "Leno pilka", "090"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",  "artist_sing", "Somo pilka", "091"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa",   "artist_run", "Riko pilka", "092"),
  make_observation_trial_sentence( "pirate_jump", "Jato barsa", "artist_sleep", "Leno pilka", "093"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "artist_sing", "Somo pilka", "094"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",   "artist_run", "Riko pilka", "095"),
  make_observation_trial_sentence("pirate_sleep", "Leno barsa",  "artist_jump", "Jato pilka", "096"),
];


// training instruction
var training_instruction_3 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:"<h3>Part 5: Sentence Training Phase</h3> \
  <p style='text-align:left'>Now that you have learned the vocabulary, it is time to move on to describing sequences of events.</p> \
	<p style='text-align:left'> We'll start off with some basic training. On each training trial you'll be shown \
		a sequence of two events (Event 1 then Event 2), each showing a character performing an action. For each sequence, \
		you will also see how that whole sequence of events is described. There can be more than one way to describe it.</p> \
  <p style='text-align:left'>There will be a 1-second break after each sequence, and a longer 20-second break in the middle of the training.</p> \
  <p style='text-align:left'><b>Please pay close attention so you can understand how the sequences are described.</b></p> \
  <p style='text-align:left'>You will be tested in the following sections.</p>",
  choices: ["Start"],
};


// weak training trial
var weak_supportive_null_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_null_sentence_trials, 16);
var weak_supportive_overt_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_overt_sentence_trials, 4);
var weak_non_supportive_null_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_null_sentence_trials, 4);
var weak_non_supportive_overt_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_overt_sentence_trials, 16);

var all_weak_trials = [].concat(
  weak_supportive_null_sentence_trials,
  weak_supportive_overt_sentence_trials,
  weak_non_supportive_null_sentence_trials,
  weak_non_supportive_overt_sentence_trials
);

all_weak_trials = jsPsych.randomization.sampleWithoutReplacement(all_weak_trials, all_weak_trials.length);

var weak_timeline_with_break = [].concat(
  all_weak_trials.slice(0, 20),
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Take a short break. This will last for 20 seconds.</p>",
    choices: ["Continue"],
    trial_duration: 20000
  },
  all_weak_trials.slice(20)
);


// strong traing trials
var strong_supportive_null_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_null_sentence_trials, 4);
var strong_supportive_overt_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_overt_sentence_trials, 16);
var strong_non_supportive_null_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_null_sentence_trials, 4);
var strong_non_supportive_overt_sentence_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_overt_sentence_trials, 16);

var all_strong_trials = [].concat(
  strong_supportive_null_sentence_trials,
  strong_supportive_overt_sentence_trials,
  strong_non_supportive_null_sentence_trials,
  strong_non_supportive_overt_sentence_trials
);

all_strong_trials = jsPsych.randomization.sampleWithoutReplacement(all_strong_trials, all_strong_trials.length);

var strong_timeline_with_break = [].concat(
  all_strong_trials.slice(0, 20),
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Take a short break. This will last for 20 seconds.</p>",
    choices: ["Continue"],
    trial_duration: 20000
  },
  all_strong_trials.slice(20)
);

var weak_sentence_training = {
    timeline: weak_timeline_with_break,
    conditional_function: function(){
        if(participant_training_condition=='condition1'){
          console.log("running weak setence training");
          return true
        } else {return false}
    }
}

var strong_sentence_training = {
    timeline: strong_timeline_with_break,
    conditional_function: function(){
        if(participant_training_condition=='condition2'){
          console.log("running strong sentence training");
          return true} else {return false}
    }
}



// weak sentence test

// instruction

var test_instruction_3 = {
  type: jsPsychHtmlButtonResponse,
 stimulus:"<h3>Part 6: Sentence Test Phase</h3> \
  <p style='text-align:left'>Now it is time to test your understanding of the more complex descriptions.</p> \
  <p style='text-align:left'>This test is similar to the ones you completed earlier, but the tasks are slightly more challenging.</p> \
  <p style='text-align:left'>In some trials, you will see a sequence of events with one event hidden, along with a sentence that describes the full sequence. Your task is to figure out what the hidden event was.</p> \
  <p style='text-align:left'>In other trials, you will see both events and part of the description, and your task is to complete the missing part of the sentence.</p> \
  <p style='text-align:left'>There will be 20 questions in total. This time, your score will not be shown during the task. Please try your best!</p>",
  choices: ["Start"],
};

var sentence_trial_n = 1;
var sentence_trial_n_max = 20;

// 1. production-multiple choice version 
function make_production_trial_2 (context_image, target_image, context_sentence, target_choices, image) {
  var object_filename_1 = "attrition_images/" + context_image + ".jpg"; //build file name for the object
  var object_filename_2 = "attrition_images/" + target_image + ".jpg";
  var shuffled_choices = jsPsych.randomization.shuffle(target_choices);
  var whole_image = "attrition_images/" + image + ".png";
  var fixation = "attrition_images/fixation.png";
  trial = {
    type: jsPsychImageButtonResponsePromptAboveImage,
    timeline: [
      {
        stimulus: whole_image,
        prompt1: function() {
          return "<p><em>Test sequence <strong>" + sentence_trial_n + "</strong> of " + sentence_trial_n_max + "</em></p>"},
        prompt2: "&nbsp;",
        choices: [],
        trial_duration: 500,
        stimulus_height: 400,
      },
      {
        stimulus: whole_image,
        prompt1: function() {
          return "<p><em>Test sequence <strong>" + sentence_trial_n + "</strong> of " + sentence_trial_n_max + "</em></p>"},
        prompt2: "<em>Please complete the missing part of the sentence:</em>",
        choices: shuffled_choices,
        // button_html: '<button class="jspsych-btn" style="width: 200px;">%choice%</button>',
        data: {
          block: "sentence_production",
          choices: shuffled_choices 
        },
        stimulus_height: 400,
        save_trial_parameters: { choices: true },
        on_finish: function(data) {
          var button_number = data.response;
          data.context_image = context_image;
          data.context_sentence = context_sentence;
          data.target_image = target_image;
          data.whole_image = whole_image;
          data.label_selected = data.choices[button_number];
          save_dyadic_interaction_data(data)
        }
      },
      {
        type: jsPsychImageButtonResponse,
        choices: [],
        stimulus: fixation,
        prompt: "&nbsp;", //dummy text
        trial_duration: 1000,
        on_start: function(){
          sentence_trial_n += 1;
        }
      }
    ],
  };
  return trial;
};


var supportive_production_trials = [
  make_production_trial_2(  "artist_run",  "artist_sing", "Riko pilka", ["somo", "somo pilka", "pilka", "pilka somo"], "101"),
  make_production_trial_2( "artist_jump",  "artist_sing", "Jato pilka", ["somo", "somo pilka", "pilka", "pilka somo"], "102"),
  make_production_trial_2("artist_sleep",  "artist_sing", "Leno pilka", ["somo", "somo pilka", "pilka", "pilka somo"], "103"),
  make_production_trial_2( "artist_sing",   "artist_run", "Somo pilka", ["riko", "riko pilka", "pilka", "pilka riko"], "104"),
  make_production_trial_2( "artist_jump",   "artist_run", "Jato pilka", ["riko", "riko pilka", "pilka", "pilka riko"], "105"),
  make_production_trial_2("artist_sleep",   "artist_run", "Leno pilka", ["riko", "riko pilka", "pilka", "pilka riko"], "106"),
  make_production_trial_2( "artist_sing",  "artist_jump", "Somo pilka", ["jato", "jato pilka", "pilka", "pilka jato"], "107"),
  make_production_trial_2(  "artist_run",  "artist_jump", "Riko pilka", ["jato", "jato pilka", "pilka", "pilka jato"], "108"),
  make_production_trial_2("artist_sleep",  "artist_jump", "Leno pilka", ["jato", "jato pilka", "pilka", "pilka jato"], "109"),
  make_production_trial_2( "artist_sing", "artist_sleep", "Somo pilka", ["leno", "leno pilka", "pilka", "pilka leno"], "110"),
  make_production_trial_2(  "artist_run", "artist_sleep", "Riko pilka", ["leno", "leno pilka", "pilka", "pilka leno"], "111"),
  make_production_trial_2( "artist_jump", "artist_sleep", "Jato pilka", ["leno", "leno pilka", "pilka", "pilka leno"], "112"),
  make_production_trial_2(  "pirate_run",  "pirate_sing", "Riko barsa", ["somo", "somo barsa", "barsa", "barsa somo"], "113"),
  make_production_trial_2( "pirate_jump",  "pirate_sing", "Jato barsa", ["somo", "somo barsa", "barsa", "barsa somo"], "114"),
  make_production_trial_2("pirate_sleep",  "pirate_sing", "Leno barsa", ["somo", "somo barsa", "barsa", "barsa somo"], "115"),
  make_production_trial_2( "pirate_sing",   "pirate_run", "Somo barsa", ["riko", "riko barsa", "barsa", "barsa riko"], "116"),
  make_production_trial_2( "pirate_jump",   "pirate_run", "Jato barsa", ["riko", "riko barsa", "barsa", "barsa riko"], "117"),
  make_production_trial_2("pirate_sleep",   "pirate_run", "Leno barsa", ["riko", "riko barsa", "barsa", "barsa riko"], "118"),
  make_production_trial_2( "pirate_sing",  "pirate_jump", "Somo barsa", ["jato", "jato barsa", "barsa", "barsa jato"], "119"),
  make_production_trial_2(  "pirate_run",  "pirate_jump", "Riko barsa", ["jato", "jato barsa", "barsa", "barsa jato"], "120"),
  make_production_trial_2("pirate_sleep",  "pirate_jump", "Leno barsa", ["jato", "jato barsa", "barsa", "barsa jato"], "121"),
  make_production_trial_2( "pirate_sing", "pirate_sleep", "Somo barsa", ["leno", "leno barsa", "barsa", "barsa leno"], "122"),
  make_production_trial_2(  "pirate_run", "pirate_sleep", "Riko barsa", ["leno", "leno barsa", "barsa", "barsa leno"], "123"),
  make_production_trial_2( "pirate_jump", "pirate_sleep", "Jato barsa", ["leno", "leno barsa", "barsa", "barsa leno"], "124")
  ];

var non_supportive_production_trials = [
  make_production_trial_2(  "pirate_run",  "artist_sing", "Riko barsa", ["somo", "somo pilka", "pilka", "pilka somo"], "125"),
  make_production_trial_2( "pirate_jump",  "artist_sing", "Jato barsa", ["somo", "somo pilka", "pilka", "pilka somo"], "126"),
  make_production_trial_2("pirate_sleep",  "artist_sing", "Leno barsa", ["somo", "somo pilka", "pilka", "pilka somo"], "127"),
  make_production_trial_2( "pirate_sing",   "artist_run", "Somo barsa", ["riko", "riko pilka", "pilka", "pilka riko"], "128"),
  make_production_trial_2( "pirate_jump",   "artist_run", "Jato barsa", ["riko", "riko pilka", "pilka", "pilka riko"], "129"),
  make_production_trial_2("pirate_sleep",   "artist_run", "Leno barsa", ["riko", "riko pilka", "pilka", "pilka riko"], "130"),
  make_production_trial_2( "pirate_sing",  "artist_jump", "Somo barsa", ["jato", "jato pilka", "pilka", "pilka jato"], "131"),
  make_production_trial_2(  "pirate_run",  "artist_jump", "Riko barsa", ["jato", "jato pilka", "pilka", "pilka jato"], "132"),
  make_production_trial_2("pirate_sleep",  "artist_jump", "Leno barsa", ["jato", "jato pilka", "pilka", "pilka jato"], "133"),
  make_production_trial_2( "pirate_sing", "artist_sleep", "Somo barsa", ["leno", "leno pilka", "pilka", "pilka leno"], "134"),
  make_production_trial_2(  "pirate_run", "artist_sleep", "Riko barsa", ["leno", "leno pilka", "pilka", "pilka leno"], "135"),
  make_production_trial_2( "pirate_jump", "artist_sleep", "Jato barsa", ["leno", "leno pilka", "pilka", "pilka leno"], "136"),
  make_production_trial_2(  "artist_run",  "pirate_sing", "Riko pilka", ["somo", "somo barsa", "barsa", "barsa somo"], "137"),
  make_production_trial_2( "artist_jump",  "pirate_sing", "Jato pilka", ["somo", "somo barsa", "barsa", "barsa somo"], "138"),
  make_production_trial_2("artist_sleep",  "pirate_sing", "Leno pilka", ["somo", "somo barsa", "barsa", "barsa somo"], "139"),
  make_production_trial_2( "artist_sing",   "pirate_run", "Somo pilka", ["riko", "riko barsa", "barsa", "barsa riko"], "140"),
  make_production_trial_2( "artist_jump",   "pirate_run", "Jato pilka", ["riko", "riko barsa", "barsa", "barsa riko"], "141"),
  make_production_trial_2("artist_sleep",   "pirate_run", "Leno pilka", ["riko", "riko barsa", "barsa", "barsa riko"], "142"),
  make_production_trial_2( "artist_sing",  "pirate_jump", "Somo pilka", ["jato", "jato barsa", "barsa", "barsa jato"], "143"),
  make_production_trial_2(  "artist_run",  "pirate_jump", "Riko pilka", ["jato", "jato barsa", "barsa", "barsa jato"], "144"),
  make_production_trial_2("artist_sleep",  "pirate_jump", "Leno pilka", ["jato", "jato barsa", "barsa", "barsa jato"], "145"),
  make_production_trial_2( "artist_sing", "pirate_sleep", "Somo pilka", ["leno", "leno barsa", "barsa", "barsa leno"], "146"),
  make_production_trial_2(  "artist_run", "pirate_sleep", "Riko pilka", ["leno", "leno barsa", "barsa", "barsa leno"], "147"),
  make_production_trial_2( "artist_jump", "pirate_sleep", "Jato pilka", ["leno", "leno barsa", "barsa", "barsa leno"], "148")
];


var supportive_production_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_production_trials, 5);
var non_supportive_production_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_production_trials, 5);

var all_production_trials = [].concat(
  supportive_production_trials,
  non_supportive_production_trials
);

all_production_trials = jsPsych.randomization.sampleWithoutReplacement(all_production_trials, all_production_trials.length);


// sentence comprehension trials
function make_comprehension_trial_2(context_image, target_sentence, context_sentence, target_image_choices, image) {
  var object_filename_1 = "attrition_images/" + context_image + ".jpg";
  var fixation = "attrition_images/fixation.png";
  var whole_image = "attrition_images/" + image + ".png";
  var trial = { 
    timeline: [
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
          return `
            <p><em>Test sequence <strong>${sentence_trial_n}</strong> of ${sentence_trial_n_max}</em></p>
            <div><img src='${whole_image}' style='max-height: 350px; height: auto;'></div>
            <p><em>Please select the hidden event:</em></p>
          `;
        },
        choices: [], 
        button_html: "<button class='jspsych-btn'><img src='attrition_images/%choice%.jpg' width='150'></button>",
        data: { block: "sentence_comprehension" },
        save_trial_parameters: { choices: true },
        on_start: function(trial) {
          var shuffled_images = jsPsych.randomization.shuffle(target_image_choices);
          trial.choices = shuffled_images;
        },
        on_finish: function(data) {
          var selected_index = data.response;
          var selected_image = data.choices[selected_index];
          data.whole_image = whole_image;
          data.context_image = context_image;
          data.context_sentence = context_sentence;
          data.target_sentence = target_sentence;
          data.image_selected = selected_image;
          save_dyadic_interaction_data(data);
        }
      },
      {
        type: jsPsychImageButtonResponse,
        choices: [],
        stimulus: fixation,
        prompt: "&nbsp;", //dummy text
        trial_duration: 1000,
        on_start: function () {
          sentence_trial_n += 1;
        }
      }
    ],
  };
  return trial;
};
var try_comprehension = make_comprehension_trial_2( "artist_jump", "Somo pilka", "Jato pilka", [ "artist_sing",  "pirate_sing",  "artist_jump",  "pirate_jump"],  "artist_jump");

var supportive_overt_comprehension_trials = [
  make_comprehension_trial_2( "artist_jump", "Somo pilka", "Jato pilka", [ "artist_sing",  "pirate_sing",  "artist_jump",  "pirate_jump"], "201"),
  make_comprehension_trial_2("artist_sleep", "Somo pilka", "Leno pilka", [ "artist_sing",  "pirate_sing", "artist_sleep", "pirate_sleep"], "202"),
  make_comprehension_trial_2( "artist_sing", "Riko pilka", "Somo pilka", [  "pirate_run",   "artist_run",  "artist_sing",  "pirate_sing"], "203"),
  make_comprehension_trial_2( "artist_jump", "Riko pilka", "Jato pilka", [  "pirate_run",   "artist_run",  "artist_jump",  "pirate_jump"], "204"),
  make_comprehension_trial_2("artist_sleep", "Riko pilka", "Leno pilka", [  "pirate_run",   "artist_run", "artist_sleep", "pirate_sleep"], "205"),
  make_comprehension_trial_2( "artist_sing", "Jato pilka", "Somo pilka", [ "pirate_jump",  "artist_jump",  "artist_sing",  "pirate_sing"], "206"),
  make_comprehension_trial_2(  "artist_run", "Jato pilka", "Riko pilka", [ "pirate_jump",  "artist_jump",   "artist_run",   "pirate_run"], "207"),
  make_comprehension_trial_2("artist_sleep", "Jato pilka", "Leno pilka", [ "pirate_jump",  "artist_jump", "artist_sleep", "pirate_sleep"], "208"),
  make_comprehension_trial_2( "artist_sing", "Leno pilka", "Somo pilka", ["pirate_sleep", "artist_sleep",  "artist_sing",  "pirate_sing"], "209"),
  make_comprehension_trial_2(  "artist_run", "Leno pilka", "Riko pilka", ["pirate_sleep", "artist_sleep",   "artist_run",   "pirate_run"], "210"),
  make_comprehension_trial_2(  "artist_run", "Somo pilka", "Riko pilka", ["pirate_sleep", "artist_sleep",  "artist_sing",  "pirate_sing"], "211"),
  make_comprehension_trial_2( "artist_jump", "Leno pilka", "Jato pilka", ["pirate_sleep", "artist_sleep",  "artist_jump",  "pirate_jump"], "212"),
  make_comprehension_trial_2(  "pirate_run", "Somo barsa", "Riko barsa", [ "artist_sing",  "pirate_sing",   "pirate_run",   "artist_run"], "213"),
  make_comprehension_trial_2( "pirate_jump", "Somo barsa", "Jato barsa", [ "artist_sing",  "pirate_sing",  "pirate_jump",  "artist_jump"], "214"),
  make_comprehension_trial_2("pirate_sleep", "Somo barsa", "Leno barsa", [ "artist_sing",  "pirate_sing", "pirate_sleep", "artist_sleep"], "215"),
  make_comprehension_trial_2( "pirate_sing", "Riko barsa", "Somo barsa", [  "artist_run",   "pirate_run",  "pirate_sing",  "artist_sing"], "216"),
  make_comprehension_trial_2( "pirate_jump", "Riko barsa", "Jato barsa", [  "artist_run",   "pirate_run",  "pirate_jump",  "artist_jump"], "217"),
  make_comprehension_trial_2("pirate_sleep", "Riko barsa", "Leno barsa", [  "artist_run",   "pirate_run", "pirate_sleep", "artist_sleep"], "218"),
  make_comprehension_trial_2( "pirate_sing", "Jato barsa", "Somo barsa", [ "artist_jump",  "pirate_jump",  "pirate_sing",  "artist_sing"], "219"),
  make_comprehension_trial_2(  "pirate_run", "Jato barsa", "Riko barsa", [ "artist_jump",  "pirate_jump",   "pirate_run",   "artist_run"], "220"),
  make_comprehension_trial_2("pirate_sleep", "Jato barsa", "Leno barsa", [ "artist_jump",  "pirate_jump", "pirate_sleep", "artist_sleep"], "221"),
  make_comprehension_trial_2( "pirate_sing", "Leno barsa", "Somo barsa", ["artist_sleep", "pirate_sleep",  "pirate_sing",  "artist_sing"], "222"),
  make_comprehension_trial_2(  "pirate_run", "Leno barsa", "Riko barsa", ["artist_sleep", "pirate_sleep",   "pirate_run",   "artist_run"], "223"),
  make_comprehension_trial_2( "pirate_jump", "Leno barsa", "Jato barsa", ["artist_sleep", "pirate_sleep",  "pirate_jump",  "artist_jump"], "224")

];

var supportive_null_comprehension_trials = [
  make_comprehension_trial_2(  "artist_run", "Somo", "Riko pilka", [ "artist_sing",  "pirate_sing",   "artist_run",   "pirate_run"], "225"),
  make_comprehension_trial_2( "artist_jump", "Somo", "Jato pilka", [ "artist_sing",  "pirate_sing",  "artist_jump",  "pirate_jump"], "226"),
  make_comprehension_trial_2("artist_sleep", "Somo", "Leno pilka", [ "artist_sing",  "pirate_sing", "artist_sleep", "pirate_sleep"], "227"),
  make_comprehension_trial_2( "artist_sing", "Riko", "Somo pilka", [  "artist_run",   "pirate_run",  "artist_sing",  "pirate_sing"], "228"),
  make_comprehension_trial_2( "artist_jump", "Riko", "Jato pilka", [  "artist_run",   "pirate_run",  "artist_jump",  "pirate_jump"], "229"),
  make_comprehension_trial_2("artist_sleep", "Riko", "Leno pilka", [  "artist_run",   "pirate_run", "artist_sleep", "pirate_sleep"], "230"),
  make_comprehension_trial_2( "artist_sing", "Jato", "Somo pilka", [ "artist_jump",  "pirate_jump",  "artist_sing",  "pirate_sing"], "231"),
  make_comprehension_trial_2(  "artist_run", "Jato", "Riko pilka", [ "artist_jump",  "pirate_jump",   "artist_run",   "pirate_run"], "232"),
  make_comprehension_trial_2("artist_sleep", "Jato", "Leno pilka", [ "artist_jump",  "pirate_jump", "artist_sleep", "pirate_sleep"], "233"),
  make_comprehension_trial_2( "artist_sing", "Leno", "Somo pilka", ["artist_sleep", "pirate_sleep",  "artist_sing",  "pirate_sing"], "234"),
  make_comprehension_trial_2(  "artist_run", "Leno", "Riko pilka", ["artist_sleep", "pirate_sleep",   "artist_run",   "pirate_run"], "235"),
  make_comprehension_trial_2( "artist_jump", "Leno", "Jato pilka", ["artist_sleep", "pirate_sleep",  "artist_jump",  "pirate_jump"], "236"),
  make_comprehension_trial_2(  "pirate_run", "Somo", "Riko barsa", [ "pirate_sing",  "artist_sing",   "pirate_run",   "artist_run"], "237"),
  make_comprehension_trial_2( "pirate_jump", "Somo", "Jato barsa", [ "pirate_sing",  "artist_sing",  "pirate_jump",  "artist_jump"], "238"),
  make_comprehension_trial_2("pirate_sleep", "Somo", "Leno barsa", [ "pirate_sing",  "artist_sing", "pirate_sleep", "artist_sleep"], "239"),
  make_comprehension_trial_2( "pirate_sing", "Riko", "Somo barsa", [  "pirate_run",   "artist_run",  "pirate_sing",  "artist_sing"], "240"),
  make_comprehension_trial_2( "pirate_jump", "Riko", "Jato barsa", [  "pirate_run",   "artist_run",  "pirate_jump",  "artist_jump"], "241"),
  make_comprehension_trial_2("pirate_sleep", "Riko", "Leno barsa", [  "pirate_run",   "artist_run", "pirate_sleep", "artist_sleep"], "242"),
  make_comprehension_trial_2( "pirate_sing", "Jato", "Somo barsa", [ "pirate_jump",  "artist_jump",  "pirate_sing",  "artist_sing"], "243"),
  make_comprehension_trial_2(  "pirate_run", "Jato", "Riko barsa", [ "pirate_jump",  "artist_jump",   "pirate_run",   "artist_run"], "244"),
  make_comprehension_trial_2("pirate_sleep", "Jato", "Leno barsa", [ "pirate_jump",  "artist_jump", "pirate_sleep", "artist_sleep"], "245"),
  make_comprehension_trial_2( "pirate_sing", "Leno", "Somo barsa", ["pirate_sleep", "artist_sleep",  "pirate_sing",  "artist_sing"], "246"),
  make_comprehension_trial_2(  "pirate_run", "Leno", "Riko barsa", ["pirate_sleep", "artist_sleep",   "pirate_run",   "artist_run"], "247"),
  make_comprehension_trial_2( "pirate_jump", "Leno", "Jato barsa", ["pirate_sleep", "artist_sleep",  "pirate_jump",  "artist_jump"], "248")
];

var non_supportive_overt_comprehension_trials = [
  make_comprehension_trial_2(  "pirate_run", "Somo pilka", "Riko barsa", [ "artist_sing",  "pirate_sing",   "pirate_run",   "artist_run"], "249"),
  make_comprehension_trial_2( "pirate_jump", "Somo pilka", "Jato barsa", [ "artist_sing",  "pirate_sing",  "pirate_jump",  "artist_jump"], "250"),
  make_comprehension_trial_2("pirate_sleep", "Somo pilka", "Leno barsa", [ "artist_sing",  "pirate_sing", "pirate_sleep", "artist_sleep"], "251"),
  make_comprehension_trial_2( "pirate_sing", "Riko pilka", "Somo barsa", [  "artist_run",   "pirate_run",  "pirate_sing",  "artist_sing"], "252"),
  make_comprehension_trial_2( "pirate_jump", "Riko pilka", "Jato barsa", [  "artist_run",   "pirate_run",  "pirate_jump",  "artist_jump"], "253"),
  make_comprehension_trial_2("pirate_sleep", "Riko pilka", "Leno barsa", [  "artist_run",   "pirate_run", "pirate_sleep", "artist_sleep"], "254"),
  make_comprehension_trial_2( "pirate_sing", "Jato pilka", "Somo barsa", [ "artist_jump",  "pirate_jump",  "pirate_sing",  "artist_sing"], "255"),
  make_comprehension_trial_2(  "pirate_run", "Jato pilka", "Riko barsa", [ "artist_jump",  "pirate_jump",   "pirate_run",   "artist_run"], "256"),
  make_comprehension_trial_2("pirate_sleep", "Jato pilka", "Leno barsa", [ "artist_jump",  "pirate_jump", "pirate_sleep", "artist_sleep"], "257"),
  make_comprehension_trial_2( "pirate_sing", "Leno pilka", "Somo barsa", ["artist_sleep", "pirate_sleep",  "pirate_sing",  "artist_sing"], "258"),
  make_comprehension_trial_2(  "pirate_run", "Leno pilka", "Riko barsa", ["artist_sleep", "pirate_sleep",   "pirate_run",   "artist_run"], "259"),
  make_comprehension_trial_2( "pirate_jump", "Leno pilka", "Jato barsa", ["artist_sleep", "pirate_sleep",  "pirate_jump",  "artist_jump"], "260"),
  make_comprehension_trial_2(  "artist_run", "Somo barsa", "Riko pilka", [ "pirate_sing",  "artist_sing",   "artist_run",   "pirate_run"], "261"),
  make_comprehension_trial_2( "artist_jump", "Somo barsa", "Jato pilka", [ "pirate_sing",  "artist_sing",  "artist_jump",  "pirate_jump"], "262"),
  make_comprehension_trial_2("artist_sleep", "Somo barsa", "Leno pilka", [ "pirate_sing",  "artist_sing", "artist_sleep", "pirate_sleep"], "263"),
  make_comprehension_trial_2( "artist_sing", "Riko barsa", "Somo pilka", [  "pirate_run",   "artist_run",  "artist_sing",  "pirate_sing"], "264"),
  make_comprehension_trial_2( "artist_jump", "Riko barsa", "Jato pilka", [  "pirate_run",   "artist_run",  "artist_jump",  "pirate_jump"], "265"),
  make_comprehension_trial_2("artist_sleep", "Riko barsa", "Leno pilka", [  "pirate_run",   "artist_run", "artist_sleep", "pirate_sleep"], "266"),
  make_comprehension_trial_2( "artist_sing", "Jato barsa", "Somo pilka", [ "pirate_jump",  "artist_jump",  "artist_sing",  "pirate_sing"], "267"),
  make_comprehension_trial_2(  "artist_run", "Jato barsa", "Riko pilka", [ "pirate_jump",  "artist_jump",   "artist_run",   "pirate_run"], "268"),
  make_comprehension_trial_2("artist_sleep", "Jato barsa", "Leno pilka", [ "pirate_jump",  "artist_jump", "artist_sleep", "pirate_sleep"], "269"),
  make_comprehension_trial_2( "artist_sing", "Leno barsa", "Somo pilka", ["pirate_sleep", "artist_sleep",  "artist_sing",  "pirate_sing"], "270"),
  make_comprehension_trial_2(  "artist_run", "Leno barsa", "Riko pilka", ["pirate_sleep", "artist_sleep",   "artist_run",   "pirate_run"], "271"),
  make_comprehension_trial_2( "artist_jump", "Leno barsa", "Jato pilka", ["pirate_sleep", "artist_sleep",  "artist_jump",  "pirate_jump"], "272"),
];


var non_supportive_null_comprehension_trials = [
  make_comprehension_trial_2(  "artist_run", "Somo", "Riko pilka", [ "pirate_sing",  "artist_sing",   "pirate_run",   "artist_run"], "273"),
  make_comprehension_trial_2( "artist_jump", "Somo", "Jato pilka", [ "pirate_sing",  "artist_sing",  "pirate_jump",  "artist_jump"], "274"),
  make_comprehension_trial_2("artist_sleep", "Somo", "Leno pilka", [ "pirate_sing",  "artist_sing", "pirate_sleep", "artist_sleep"], "275"),
  make_comprehension_trial_2( "artist_sing", "Riko", "Somo pilka", [  "pirate_run",   "artist_run",  "pirate_sing",  "artist_sing"], "276"),
  make_comprehension_trial_2( "artist_jump", "Riko", "Jato pilka", [  "pirate_run",   "artist_run",  "pirate_jump",  "artist_jump"], "277"),
  make_comprehension_trial_2("artist_sleep", "Riko", "Leno pilka", [  "pirate_run",   "artist_run", "pirate_sleep", "artist_sleep"], "278"),
  make_comprehension_trial_2( "artist_sing", "Jato", "Somo pilka", [ "pirate_jump",  "artist_jump",  "pirate_sing",  "artist_sing"], "279"),
  make_comprehension_trial_2(  "artist_run", "Jato", "Riko pilka", [ "pirate_jump",  "artist_jump",   "pirate_run",   "artist_run"], "280"),
  make_comprehension_trial_2("artist_sleep", "Jato", "Leno pilka", [ "pirate_jump",  "artist_jump", "pirate_sleep", "artist_sleep"], "281"),
  make_comprehension_trial_2( "artist_sing", "Leno", "Somo pilka", ["pirate_sleep", "artist_sleep",  "pirate_sing",  "artist_sing"], "282"),
  make_comprehension_trial_2(  "artist_run", "Leno", "Riko pilka", ["pirate_sleep", "artist_sleep",   "pirate_run",   "artist_run"], "283"),
  make_comprehension_trial_2( "artist_jump", "Leno", "Jato pilka", ["pirate_sleep", "artist_sleep",  "pirate_jump",  "artist_jump"], "284"),
  make_comprehension_trial_2(  "pirate_run", "Somo", "Riko barsa", [ "artist_sing",  "pirate_sing",   "artist_run",   "pirate_run"], "285"),
  make_comprehension_trial_2( "pirate_jump", "Somo", "Jato barsa", [ "artist_sing",  "pirate_sing",  "artist_jump",  "pirate_jump"], "286"),
  make_comprehension_trial_2("pirate_sleep", "Somo", "Leno barsa", [ "artist_sing",  "pirate_sing", "artist_sleep", "pirate_sleep"], "287"),
  make_comprehension_trial_2( "pirate_sing", "Riko", "Somo barsa", [  "artist_run",   "pirate_run",  "artist_sing",  "pirate_sing"], "288"),
  make_comprehension_trial_2( "pirate_jump", "Riko", "Jato barsa", [  "artist_run",   "pirate_run",  "artist_jump",  "pirate_jump"], "289"),
  make_comprehension_trial_2("pirate_sleep", "Riko", "Leno barsa", [  "artist_run",   "pirate_run", "artist_sleep", "pirate_sleep"], "290"),
  make_comprehension_trial_2( "pirate_sing", "Jato", "Somo barsa", [ "artist_jump",  "pirate_jump",  "artist_sing",  "pirate_sing"], "291"),
  make_comprehension_trial_2(  "pirate_run", "Jato", "Riko barsa", [ "artist_jump",  "pirate_jump",   "artist_run",   "pirate_run"], "292"),
  make_comprehension_trial_2("pirate_sleep", "Jato", "Leno barsa", [ "artist_jump",  "pirate_jump", "artist_sleep", "pirate_sleep"], "293"),
  make_comprehension_trial_2( "pirate_sing", "Leno", "Somo barsa", ["artist_sleep", "pirate_sleep",  "artist_sing",  "pirate_sing"], "294"),
  make_comprehension_trial_2(  "pirate_run", "Leno", "Riko barsa", ["artist_sleep", "pirate_sleep",   "artist_run",   "pirate_run"], "295"),
  make_comprehension_trial_2( "pirate_jump", "Leno", "Jato barsa", ["artist_sleep", "pirate_sleep",  "artist_jump",  "pirate_jump"], "296"),
];

var weak_supportive_overt_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_overt_comprehension_trials, 1);
var weak_non_supportive_null_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_null_comprehension_trials, 1);
var weak_non_supportive_overt_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_overt_comprehension_trials, 4);
var weak_supportive_null_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_null_comprehension_trials, 4);

var strong_supportive_overt_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_overt_comprehension_trials, 4);
var strong_non_supportive_null_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_null_comprehension_trials, 1);
var strong_non_supportive_overt_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(non_supportive_overt_comprehension_trials, 4);
var strong_supportive_null_comprehension_trials = jsPsych.randomization.sampleWithoutReplacement(supportive_null_comprehension_trials, 1);

var all_weak_sentence_test_trials = [].concat(
  weak_supportive_null_comprehension_trials,
  weak_non_supportive_null_comprehension_trials,
  weak_non_supportive_overt_comprehension_trials,
  weak_supportive_overt_comprehension_trials,
  supportive_production_trials,
  non_supportive_production_trials
);

var all_strong_sentence_test_trials = [].concat(
  strong_supportive_null_comprehension_trials,
  strong_non_supportive_null_comprehension_trials,
  strong_non_supportive_overt_comprehension_trials,
  strong_supportive_overt_comprehension_trials,
  supportive_production_trials,
  non_supportive_production_trials
);

all_weak_sentence_test_trials = jsPsych.randomization.sampleWithoutReplacement(all_weak_sentence_test_trials, all_weak_sentence_test_trials.length);

all_strong_sentence_test_trials = jsPsych.randomization.sampleWithoutReplacement(all_strong_sentence_test_trials, all_strong_sentence_test_trials.length);

var weak_sentence_pre_test = {
    timeline: all_weak_sentence_test_trials,
    conditional_function: function(){
        if(participant_training_condition=='condition1'){
          console.log("running weak sentence test");
          return true
        } else {return false}
    }
}

var strong_sentence_pre_test = {
      timeline: all_strong_sentence_test_trials,
    conditional_function: function(){
        if(participant_training_condition=='condition2'){
          console.log("running strong sentence test");
          return true} else {return false}
    }
}

var weak_sentence_final_trial = {
    timeline: all_weak_sentence_test_trials,
    conditional_function: function(){
        if(participant_training_condition=='condition1'){
          console.log("running weak sentence post test");
          return true
        } else {return false}
    }
}

var strong_sentence_final_trial = {
      timeline: all_strong_sentence_test_trials,
    conditional_function: function(){
        if(participant_training_condition=='condition2'){
          console.log("running strong sentence post test");
          return true} else {return false}
    }
}



var test_instruction_4 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "<h3>Part 8: Sentence Test Phase</h3> \
  <p style='text-align:left'>This is the final part of the experiment. It is similar to the previous sentence tests.</p> \
  <p style='text-align:left'>On some trials, you will see a sequence of events with one event hidden, and you need to identify the hidden event.</p> \
  <p style='text-align:left'>On other trials, both events will be shown and you will need to complete the missing part of the description.</p> \
  <p style='text-align:left'>Because this is the final test, your score will not be displayed during the task. Please do your best!</p>",
  choices: ["Start"],
     on_finish: function () {
    sentence_trial_n = 1
   },
};

// interaction loop
var start_interaction_loop = {
  type: jsPsychCallFunction,
  func: interaction_loop,
};

var instruction_screen_enter_waiting_room = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
  "<h3>You are about to enter the waiting room for pairing!</h3>\
  <p style='text-align:left'>Well done! We are now moving to the interaction part.</p> \
  <p style='text-align:left'> Once you proceed past this point we will attempt to pair \
  you with another participant. As soon as you are paired you will start to play the \
  communication game together. <b> Once you are paired, your partner will be waiting for you \
  and depends on you to finish the experiment</b>, so please progress through the experiment \
  in a timely fashion, and please if at all possible <b>don't abandon or reload the \
  experiment</b> since this will also end the experiment for your partner.</p>",
  choices: ["Continue"],
};

function waiting_room() {
  var waiting_room_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "You are in the waiting room",
    choices: [],
    on_finish: function () {
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(waiting_room_trial);
  jsPsych.resumeExperiment();
};

function waiting_for_partner() {
  end_waiting(); //end any current waiting trial
  var waiting_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Waiting for partner...",
    choices: [],
    on_finish: function () {
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(waiting_trial);
  jsPsych.resumeExperiment();
}

function end_waiting() {
  if (
    jsPsych.getCurrentTrial().stimulus == "Waiting for partner..." ||
    jsPsych.getCurrentTrial().stimulus == "You are in the waiting room"
  ) {
    jsPsych.finishTrial();
  }
}

function show_interaction_instructions() {
  end_waiting();
  var instruction_screen_interaction = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<h3>Part 7: Interaction Phase</h3> \
  <p style='text-align:left'>Now it is time to communicate with your partner. This part works similarly to the sentence test you just completed, but it's a bit more complex.</p> \
  <p style='text-align:left'>In some trials, you will see two events and complete the missing part of the description. Your completed description will then be sent to your partner, who will choose a picture based on your description.</p> \
  <p style='text-align:left'>In other trials, the roles will be reversed: you will receive a description from your partner and choose the correct picture based on it.</p> \
  <p style='text-align:left'>In each round, you will take on both roles. There are 24 rounds in total.</p> \
  <p style='text-align:left'>After each trial, you will receive feedback indicating whether your team selected the correct answer.</p>",
  choices: ["Start"],
    choices: ["Continue"],
    on_finish: function () {
      send_to_server({ response_type: "INTERACTION_INSTRUCTIONS_COMPLETE" });
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(instruction_screen_interaction);
  jsPsych.resumeExperiment();
}

function partner_dropout() {
  end_waiting();
  var stranded_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Oh no, something has gone wrong!</h3>\
      <p style='text-align:left'>Unfortunately it looks like something has gone wrong - sorry!</p>\
      <p style='text-align:left'>Clock continue to progress to the final screen and finish the experiment.</p>",
    choices: ["Continue"],
  };
  jsPsych.addNodeToEndOfTimeline(stranded_screen);
  end_experiment();
}

function end_experiment() {
  //close socket - to be used immediately
  var close_socket_function_call = {
    type: jsPsychCallFunction,
    func: function () {
      close_socket();
    }
  }
  //for after the final test trials are completed
  var final_save_data_function_call = {
    type: jsPsychCallFunction,
    func: function () {
      jsPsych.data.addProperties({"participant_id": participant_id});
      jsPsych.data.addProperties({"training_condition": participant_training_condition});
      var experiment_data = jsPsych.data.get();
      save_data(participant_id+"_data.csv", experiment_data.csv());
    }
  };
  var final_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
      "<h3>Finished!</h3>\
      <p style='text-align:left'>Click below to finish the experiment and be redirected to Prolific. \
      Thanks for your participation!</p>",
    choices: ["Continue"],
    on_finish: function () {
      jsPsych.endCurrentTimeline();
    },
  };

  end_waiting();
  jsPsych.addNodeToEndOfTimeline(close_socket_function_call);
  jsPsych.addNodeToEndOfTimeline(test_instruction_4);
  jsPsych.addNodeToEndOfTimeline(weak_sentence_final_trial);
  jsPsych.addNodeToEndOfTimeline(strong_sentence_final_trial);
  jsPsych.addNodeToEndOfTimeline(final_save_data_function_call);
  jsPsych.addNodeToEndOfTimeline(final_screen);
  jsPsych.resumeExperiment();
};

var trial_n_int = 1;
// director trial
//NB passing matcher choices in here so the director's response includes them - makes life easier at the server end!
function director_trial(context_image, target_image, context_sentence, target_choices, matcher_choices, partner_id, whole_image_d, whole_image_m) {
  end_waiting();
  var object_filename_1 = "attrition_images/" + context_image + ".jpg"; 
  var object_filename_2 = "attrition_images/" + target_image + ".jpg";
  var whole_image_d = "attrition_images/" + whole_image_d + ".png";

  //some variables to help us keep track of the loop for repeated clicking
  var label_selected; //to be filled in later
  var n_clicks_required; //to be filled in later
  var n_clicks_given = 0;

  //subtrial 0 - inform
  var subtrial0 = {
    type: jsPsychHtmlKeyboardResponse,
        stimulus: function(){
        return "<p><em> Round <strong>" + trial_n_int + "</strong> of 24. </em></p>";
    },
    prompt: '<p style="font-size: 20px; text-align: center;">Now you are the <b>director</b></p>',
    choices: "NO_KEYS", 
    trial_duration: 1000,
  };
  //subtrial 1 - just show the object
  var subtrial1 = {
    type: jsPsychImageButtonResponsePromptAboveImage,
    stimulus: whole_image_d,
    prompt1: function() {
          return "<p><em>Round <strong>" + trial_n_int + "</strong> of 24. </em></p>"}, 
     prompt2: context_sentence + ", ___.",
    choices: [], //these buttons are invisible and unclickable!
    response_ends_trial: false,
    trial_duration: 500,
    stimulus_height: 400,
  };
  var subtrial2 = {
    type: jsPsychImageButtonResponsePromptAboveImage,
    stimulus: whole_image_d,
    prompt1: function() {
          return "<p><em>Round <strong>" + trial_n_int + "</strong> of 24. </em></p>"},
    prompt2: context_sentence + ", ___. <br> <br> <em>Please complete the missing part of the sentence: </em>",
    choices: [],
    stimulus_height: 400,
    on_start: function (trial) {
      var shuffled_label_choices = jsPsych.randomization.shuffle(target_choices);
      trial.choices = shuffled_label_choices;
      trial.data = {
        block: "director",
        button_choices: shuffled_label_choices,
      };
    },
    on_finish: function (data) {
      var button_number = data.response;
      data.context_sentence = context_sentence;
      data.context_image = context_image;
      label_selected = data.button_choices[button_number]; //keep track of this in our variable
      data.button_selected = label_selected; 
      data.partner_id = partner_id; 
      data.target_image = target_image;
      data.whole_image = whole_image_d;
      trial_n_int += 1;
      save_dyadic_interaction_data(data); 
    },
  };


  var message_to_server = {
    type: jsPsychCallFunction,
    func: function () {
      //let the server know what label the director selected,
      //and some other info that makes the server's life easier
      send_to_server({
        response_type: "RESPONSE",
        role: "Director",
        participant: participant_id,
        partner: partner_id,
        context_sentence: context_sentence,
        context_image: context_image,
        target_image: target_image,
        response: label_selected,
        matcher_choices: matcher_choices,
        whole_image_d: whole_image_d,
        whole_image_m: whole_image_m,
      });
      jsPsych.pauseExperiment();}
    };

  //put the three sub-parts plus the message-send together in a single complex trial
  var trial = {
    timeline: [subtrial0, subtrial1, subtrial2, message_to_server],
  };
  jsPsych.addNodeToEndOfTimeline(trial);
  jsPsych.resumeExperiment();
}

  

  var trial_n_int_matcher = 1;
function matcher_trial(context_image, context_sentence, target_image, director_target_sentence, target_image_choices, partner_id, whole_image_d, whole_image_m) {
  end_waiting();
  var object_filename_1 = "attrition_images/" + context_image + ".jpg";
  var whole_image_d = "attrition_images/" + whole_image_d + ".png";
  var whole_image_m = "attrition_images/" + whole_image_m + ".png";
  var trial = { 
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function(){
        return "<p><em> Round <strong>" + trial_n_int_matcher + "</strong> of 24. </em></p>";
    },
       prompt: '<p style="font-size: 20px; text-align: center;">Now you are the <b>matcher</b></p>',
        choices: "NO_KEYS", 
        trial_duration: 1000,
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
          return `
           <p><em> Round <strong> ${trial_n_int_matcher} </strong> of 24. </em></p>
            <div><img src='${whole_image_m}'style='max-height: 300px; height: auto;'></div>
            <p>${context_sentence}, ${director_target_sentence}.</p>
            <p><em>Please select the hidden event:</em></p>
          `;
        },
        choices: [], 
        button_html: "<button class='jspsych-btn'><img src='attrition_images/%choice%.jpg' width='150'></button>",
        data: { block: "matcher" },
        save_trial_parameters: { choices: true },
        on_start: function(trial) {
          var shuffled_images = jsPsych.randomization.shuffle(target_image_choices);
          trial.choices = shuffled_images;
        },
        on_finish: function(data) {
          var selected_index = data.response;
          var selected_image = data.choices[selected_index];
          data.context_sentence = context_sentence;
          data.context_image = context_image;
          data.target_image = target_image;
          data.image_selected = selected_image;
          data.exp_trial_type = "matcher";
          data.partner_id = partner_id;
          data.target_sentence = director_target_sentence;
          data.whole_image = whole_image_m
          trial_n_int_matcher += 1;
          save_dyadic_interaction_data(data);

          send_to_server({
            response_type: "RESPONSE",
            participant: participant_id,
            partner: partner_id,
            role: "Matcher",
            target_image: target_image,
            director_target_sentence: director_target_sentence,
            response: data.image_selected, 
            whole_image_d: whole_image_d,
            whole_image_m: whole_image_m
          });

          jsPsych.pauseExperiment();
        },
      },
    ],
  };
  jsPsych.addNodeToEndOfTimeline(trial);
  jsPsych.resumeExperiment();
};


function display_feedback(score) {
  end_waiting();

  var correct_or_not

  if (score == 1) {
    var feedback_stim = "Correct! The matcher selected the same image the director saw.";
    correct_or_not = 1;
  } else {
    var feedback_stim = "Incorrect! The matcher selected a different image than the one shown to the director.";
    correct_or_not = 0;
  }
  var feedback_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: feedback_stim,
    choices: [],
    data: { block: "interaction_feedback" },
    trial_duration: 2000,
    on_finish: function (data) {
      data.correct_or_not = correct_or_not;
      save_dyadic_interaction_data(data);
      send_to_server({ response_type: "FINISHED_FEEDBACK" });
      jsPsych.pauseExperiment();
    },
  };
  jsPsych.addNodeToEndOfTimeline(feedback_trial);
  jsPsych.resumeExperiment();
}

var preload_trial = {
  type: jsPsychPreload,
  auto_preload: true,
};

var full_timeline = [].concat(
preload_trial,
consent_screen,
get_participant_id,
wait_for_parameters_screen,
write_headers,
training_instruction_1,
noun_observation_trials,
test_instruction_1,
noun_test_trials,
training_instruction_2,
verb_observation_trials,
test_instruction_2,
verb_test_trials,
training_score_check,
training_instruction_3,
weak_sentence_training,
strong_sentence_training,
test_instruction_3,
weak_sentence_pre_test,
strong_sentence_pre_test,
instruction_screen_enter_waiting_room,
start_interaction_loop,
);
jsPsych.run(full_timeline);