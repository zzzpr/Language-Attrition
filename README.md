# The Role of Interaction in L1 Attrition  
**How It Affects Null and Overt Subject Use in an Artificial Language**  
*MSc Dissertation Project, University of Edinburgh*

This repository contains the full experiment code for an artificial language study conducted as part of a Master's dissertation at the University of Edinburgh. The experiment was deployed on [Prolific](https://www.prolific.com) and investigates how interaction affects the use of null and overt subjects in an artificial language, particularly in the context of L1 attrition.

---

## Project Overview

This experiment explores how interactive contexts influence speakers experiencing first language attrition, focusing on their use of null vs. overt subject forms in an artificial language. The design supports real-time two-player interaction with dynamic role allocation and data synchronization.

---

## Repository Structure

| Folder / File | Description |
|---------------|-------------|
| `imagegen/` | Scripts for batch-generating experimental images. See `README` inside this folder for more details. |
| `attrition-images/` | Images used in the experiment. **Note:** These images are not owned by the author, so only filenames are retained. |
| `server/` | A WebSocket server used to pair participants and receive experimental data. |
| `CORRECT/`, `incorrect/` | Audio feedback files used during the experiment. |
| `allocator.html`, `participant_id_allocator.php` | Files for assigning unique participant IDs. |
| `plugin-image-button-response-promptaboveimage/` | A custom jsPsych plugin created for this study. |
| `save_data.php` | Backend script for storing experiment data. |
| `trial_d.html`, `trial_d.js` | Main experimental interface, built using jsPsych plugins. |
| `utilities.js` | Core module for managing a real-time two-person interaction task via WebSocket, including role assignment, data synchronization, and error handling. |

---

## Technologies Used

- HTML / JavaScript (with [jsPsych](https://www.jspsych.org/))
- WebSocket for real-time two-player interactions
- PHP for server-side operations (ID allocation, data saving)
- Node.js WebSocket server
- Python (for image generation in `imagegen/`)

---

## License

This project is for academic and research purposes only. It does **not** include redistribution rights for the images in `attrition-images/`.

---

## Acknowledgments

This codebase was developed for a dissertation under the supervision of Prof. Kenny Smith and Prof. Antonella Sorace, at the University of Edinburgh.
