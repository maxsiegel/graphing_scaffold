var jsPsychCustomGraphClick = (function (jspsych) {
  'use strict';

  // ==== BOILERPLATE ===================================================================
  // (copied this from audio button plugin)
  function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	// Gets all non-builtin properties up the prototype chain
	const getAllProperties = object => {
		const properties = new Set();

		do {
			for (const key of Reflect.ownKeys(object)) {
				properties.add([object, key]);
			}
		} while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

		return properties;
	};

	var autoBind = (self, {include, exclude} = {}) => {
		const filter = key => {
			const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

			if (include) {
				return include.some(match);
			}

			if (exclude) {
				return !exclude.some(match);
			}

			return true;
		};

		for (const [object, key] of getAllProperties(self.constructor.prototype)) {
			if (key === 'constructor' || !filter(key)) {
				continue;
			}

			const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
			if (descriptor && typeof descriptor.value === 'function') {
				self[key] = self[key].bind(self);
			}
		}

		return self;
	};

	var autoBind$1 = /*@__PURE__*/getDefaultExportFromCjs(autoBind);

  var version = "2.1.0";

  // ==== PARAMETERS ====================================================================
  const info = {
    name: "custom-graph-click",
    version,
    parameters: {
      // /** The height of the item to be measured. Any units can be used
      //  * as long as you are consistent with using the same units for
      //  * all parameters. */
      // bar_height: {
      //   type: jspsych.ParameterType.INT,
      //   default: 1
      // },
      // /** The width of the item to be measured. */
      // bar_width: {
      //   type: jspsych.ParameterType.INT,
      //   default: 1
      // },
      /** The static part of the graph. Leave empty spaces for the 
       * interactive data points. */
      graph_image: {
        type: jspsych.ParameterType.STRING,
        default: void 0        
      },
      /** The image that represents a single datapoint. The position/scale of this will update in response to user input. 
       * For this specific plugin, the image moves to whereever the user clicks. Currently, it does not move when dragged */
      // customize documentation
      bar_image: {
        type: jspsych.ParameterType.STRING,
        default: void 0        
      },
      /** The content displayed below the graph and above the button. */
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null
      },
      /** Path to audio file to be played. */
	    audio: {
	      type: jspsych.ParameterType.AUDIO,
	      default: void 0
	    },
      /**
	     * If true, then responses are allowed while the audio is playing. If false, then the audio must finish
	     * playing before the button choices are enabled and a response is accepted. Once the audio has played
	     * all the way through, the buttons are enabled and a response is allowed (including while the audio is
	     * being re-played via on-screen playback controls).
	     */
	    response_allowed_while_playing: {
	      type: jspsych.ParameterType.BOOL,
	      default: false
	    },
      /** Label to display on the button to complete the trial. */
      button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Continue"
      }
    },
    data: {
      /** Final height of the bar, measured from the axis to the top of the image. */
      final_height_px: {
        type: jspsych.ParameterType.INT
      },
      /** Final height normalized to (0, 1] relative to the height of the graph (max height) */
      final_height_norm: {
        type: jspsych.ParameterType.FLOAT
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  class GraphClickPlugin {
    constructor(jsPsych) {
	    this.jsPsych = jsPsych;
	    this.response = { rt: null, key: null };
	    autoBind$1(this);
	  }
    static {
      this.info = info;
    }

    async trial(display_element, trial) {
      // ==== HTML SETUP =================================================================
      const graph_height = 400;
      const max_height = 280;
      
      // customize html here
      const point_height = Math.round(max_height / 10);
      const custom_bar_style = "overflow: hidden;";
      const custom_img_style = "height: " + point_height + "px;";

      // default
      const bar_style = 
        "height: " + max_height + "px;" +
        "width: 20%;" + 
        "position: absolute;" + 
        "bottom: 17.6%;" + 
        "right: 0;" + 
        "border-style: solid;" +
        "border-color: lightgray;" +
        "display: flex;" + 
        "justify-content: center;" + 
        custom_bar_style;
      const img_style = "content: url('" + trial.bar_image + "');" + 
        custom_img_style;
      let html = '<div id="jspsych-resize-graph-container" style="position: relative;">';
      html += '<img id="jspsych-resize-background" src="' + trial.graph_image + '" style="height: ' + graph_height + 'px"/>';
      html += '<div id="jspsych-resize-bar-container" style="' + bar_style + '">';
      html += '<div id="jspsych-resize-div" style="' + img_style + '"></div>';
      html += '</div></div>'; // ends of containers
      if (trial.prompt !== null) {
        html += trial.prompt;
      }
      html += '<button class="jspsych-btn" id="jspsych-resize-btn">' + trial.button_label + "</button>";
      display_element.innerHTML = html;

      // customize bar logic here
      // initial setup
      const bar_div = display_element.querySelector("#jspsych-resize-div");
      const start_ratio = 0.25;
      bar_div.style.marginTop = max_height + "px";
      
      const bar_bounds = document.getElementById("jspsych-resize-bar-container").getBoundingClientRect();
      const bar_top_coor = Math.round(bar_bounds.top);
      const mousedownevent = (e) => {
        e.preventDefault();
        const mouse_y = e.pageY || e.targetTouches[0].pageY;
        let new_y = mouse_y - bar_top_coor - Math.round(point_height / 2);
        new_y = Math.max(new_y, 0);
        new_y = Math.min(new_y, max_height - point_height);
        bar_div.style.marginTop = new_y + "px";
      };
      
      // play the audio (default)
      this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.audio);
      const next_button = document.getElementById("jspsych-resize-btn");
      const enable_button = () => {
        next_button.removeAttribute("disabled");
      }
	    if (!trial.response_allowed_while_playing) {
        next_button.setAttribute("disabled", "disabled");
	      this.audio.addEventListener("ended", enable_button);
	    }
      this.audio.play();

      display_element.querySelector("#jspsych-resize-bar-container").addEventListener("mousedown", mousedownevent);
      display_element.querySelector("#jspsych-resize-bar-container").addEventListener("touchstart", mousedownevent);
      
      const end_trial = () => {
        this.audio.stop();
        this.audio.removeEventListener("ended", enable_button);

        document.removeEventListener("mousedown", mousedownevent);
        document.removeEventListener("touchstart", mousedownevent);
        
        // customize trial data here
        const final_height_px = max_height - bar_div.marginTop;
        var trial_data = {
          final_height_px: final_height_px,
          final_height_norm: final_height_px / max_height
        };
        this.trial_complete(trial_data);
      };

      next_button.addEventListener("click", () => {
        end_trial();
      });

	    return new Promise((resolve) => {
	      this.trial_complete = resolve;
	    });
    }
  }

  return GraphClickPlugin;

})(jsPsychModule);
