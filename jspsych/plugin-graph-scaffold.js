var jsPsychGraphScaffold = (function (jspsych) {
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
    name: "graph-scaffold",
    version,
    parameters: {
      /** The image path for the static part of the graph. 
       * Leave empty spaces for the input spaces. */
      static_image: {
        type: jspsych.ParameterType.STRING,
        default: void 0        
      },
      /** Height of the static image */
      static_height: {
        type: jspsych.ParameterType.INT,
        default: 365
      },
      /** The path for the image inside the input area. 
       * Changes dynamically in response to user input. */
      dynamic_image: {
        type: jspsych.ParameterType.STRING,
        default: void 0        
      },
      /** Height of the dynamic image */
      dynamic_height: {
        type: jspsych.ParameterType.INT,
        default: 20
      },
      /** The behavior of the bar image in response to input.
       * Supported behaviors are "grow", "rise", and "click"
       */
      input_type: {
        type: jspsych.ParameterType.STRING,
        default: "click"
      },
      /** The number of discrete steps that the input space is broken up into.
       * Set to a number >= 2 for valid discrete behavior.
       * Set to a number <= 1 (i.e. 0 or -1) for continuous behavior.
       */
      input_steps: {
        type: jspsych.ParameterType.INT,
        default: -1
      },
      /** Width of the input space - starts at the top-right corner of the static image */
      input_width: {
        type: jspsych.ParameterType.INT,
        default: 200
      },
      /** Height of the input space - starts at the top-right corner of the static image */
      input_height: {
        type: jspsych.ParameterType.INT,
        default: 300
      },
      /** Distance from the right edge of the static image to the edge of the input window */
      input_margin_right: {
        type: jspsych.ParameterType.INT,
        default: 0
      },
      /** Initial input height. */
      initial_height: {
        type: jspsych.ParameterType.INT,
        default: 100
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
      /**
       * If true, the user must interact with the input window before the buttons are enabled.
       */
      input_required: {
        type: jspsych.ParameterType.BOOL,
	      default: true
      },
      /** The content displayed below the graph and above the button. */
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null
      },
      /** Label to display on the button to complete the trial. */
      button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Continue"
      },
      /** Image for the next button */
      button_img: {
        type: jspsych.ParameterType.STRING,
        default: void 0
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
      },
      /** HTML of the displayed image at the time of submission.
       * Used to reconstruct what the user input looked like for data visualization.
       */
      html: {
        type: jspsych.ParameterType.STRING,
      },
      /** Screenshot of the displayed image at the time of submission as a data url.
       * Used to reconstruct what the user input looked like for data visualization.
       */
      image: {
        type: jspsych.ParameterType.STRING,
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  class GraphScaffoldPlugin {
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
      // customize html here
      let custom_input_space_style;
      if (trial.input_type === "grow") {
        custom_input_space_style = "align-items: end; cursor: nwse-resize;";
      } else if (trial.input_type === "rise") {
        custom_input_space_style = "overflow: hidden; cursor: ns-resize;";
      } else if (trial.input_type === "click") {
        custom_input_space_style = "overflow: hidden;";
      } else {
        throw error("invalid input type");
      }

      // default
      let html = `
        <div id="jspsych-graph-scaffold-container" style="position: relative;">
          <img 
            id="static-image" 
            src="${trial.static_image}"
            height="${trial.static_height}"
            crossorigin="anonymous"
          />
          <div 
            id="input-space"
            style="
              height: ${trial.input_height}px;
              width:  ${trial.input_width}px;
              margin-right: ${trial.input_margin_right}px;
              position: absolute;
              top: 0;
              right: 0; 
              border-style: solid;
              border-color: lightgray;
              display: flex; 
              justify-content: center;
              ${custom_input_space_style}
            "
          >
            <div 
              id="dynamic-image" 
              style="
                height: ${trial.dynamic_height}px;
              " 
            >
              <img
                src="${trial.dynamic_image}"
                style="
                  max-height:100%;
                  width: auto;
                "
                crossorigin="anonymous"
              />
            </div>
          </div>
        </div>
      `;
      if (trial.prompt !== null) {
        html += trial.prompt;
      }
      console.log(trial.button_img);
      const button_content = (trial.button_img)? `<img src="${trial.button_img}" height="50px"/>` : trial.button_label;
      html += '<button class="jspsych-btn" id="jspsych-resize-btn">' + button_content + "</button>";
      
      display_element.innerHTML = html;

      const round = (y) => {
        if (trial.input_steps > 1) {
          const ratio = y / trial.input_height;
          const rounded_ratio = Math.round(ratio * trial.input_steps) / trial.input_steps;
          const rounded_y = rounded_ratio * trial.input_height;
          return rounded_y;
        } else {
          return Math.round(y);
        }
      }

      // customize bar logic here
      const dyn_img = display_element.querySelector("#dynamic-image");
      const min_height = 20;
      
      const get_func = {};
      get_func["grow"] = () => parseInt(dyn_img.style.height);
      get_func["rise"] = () => trial.input_height - parseInt(dyn_img.style.marginTop);
      get_func["click"] = () => trial.input_height - parseInt(dyn_img.style.marginTop);

      const set_func = {};
      set_func["grow"] = (old_y, abs_y, dy) => {
        const new_y = Math.min(trial.input_height, Math.max(min_height, old_y + dy));
        dyn_img.style.height = round(new_y) + "px";
      };
      set_func["rise"] = (old_y, abs_y, dy) => {
        const new_y = Math.min(trial.input_height, Math.max(min_height, old_y + dy));
        dyn_img.style.marginTop = (trial.input_height - round(new_y)) + "px";
        return old_y;
      };
      set_func["click"] = (old_y, abs_y, dy) => {
        const new_y = Math.min(trial.input_height, Math.max(-1, abs_y));
        dyn_img.style.marginTop = (trial.input_height - round(new_y)) + "px";
      };

      const get_y = get_func[trial.input_type];
      const set_y = set_func[trial.input_type];

      // default interaction logic
      const axis_y = Math.round(document.getElementById("input-space").getBoundingClientRect().bottom);
      let dragging = false;
      let click_y;
      
      // initial height
      let old_y = round(trial.initial_height);
      set_y(old_y, 0, 0);

      // require some form of input
      const next_button = document.getElementById("jspsych-resize-btn");
      const enable_button = () => {
        next_button.disabled = false;
        // next_button.removeAttribute("disabled");
      }
	    if (trial.input_required) {
        console.log("input required");
        next_button.disabled = true;
        // next_button.setAttribute("disabled", "disabled");
      }
      
      const mousedownevent = (e) => {
        e.preventDefault();
        enable_button();
        dragging = true;
        click_y = e.pageY || e.targetTouches[0].pageY;
        old_y = get_y();
        set_y(old_y, axis_y - click_y, 0);
      };
      
      const mouseupevent = (e) => {
        dragging = false;
      };
      
      const resizeevent = (e) => {
        if (dragging) {
          const pointer_y = e.pageY || e.targetTouches[0].pageY;
          const dy = click_y - pointer_y;
          set_y(old_y, axis_y - pointer_y, dy);
        }
      };

      // play the audio (default)
      this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.audio);
      if (!trial.response_allowed_while_playing) {
        next_button.setAttribute("disabled", "disabled");
	      this.audio.addEventListener("ended", enable_button);
	    }
      this.audio.play();

      display_element.querySelector("#input-space").addEventListener("mousedown", mousedownevent);
      display_element.querySelector("#input-space").addEventListener("touchstart", mousedownevent);
      document.addEventListener("mouseup", mouseupevent);
      document.addEventListener("touchend", mouseupevent);
      document.addEventListener("mousemove", resizeevent);
      document.addEventListener("touchmove", resizeevent);

      const end_trial = () => {
        this.audio.stop();
        this.audio.removeEventListener("ended", enable_button);

        document.removeEventListener("mousedown", mousedownevent);
        document.removeEventListener("touchstart", mousedownevent);
        document.removeEventListener("mousemove", resizeevent);
        document.removeEventListener("touchmove", resizeevent);
        document.removeEventListener("mouseup", mouseupevent);
        document.removeEventListener("touchend", mouseupevent);
        
        // customize trial data here
        let data_url="unsupported";
        const container = display_element.querySelector("#jspsych-graph-scaffold-container");
        html2canvas(container, {
          useCORS: true,
          logging: false,
        }).then(canvas => {
          data_url = canvas.toDataURL('image/png');
          const final_height_px = get_y();
          var trial_data = {
            final_height_px: final_height_px,
            final_height_norm: final_height_px / trial.input_height,
            html: display_element.innerHTML,
            image: data_url
          };
          this.trial_complete(trial_data);
        });
      };

      next_button.addEventListener("click", () => {
        end_trial();
      });

	    return new Promise((resolve) => {
	      this.trial_complete = resolve;
	    });
    }
  }

  return GraphScaffoldPlugin;

})(jsPsychModule);
