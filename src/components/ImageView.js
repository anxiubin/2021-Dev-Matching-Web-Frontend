import { IMAGE_PATH_PREFIX } from "../constants/index.js"

export default function ImageView({ $app, initialState, onClick }) {
	this.state = initialState

	this.$target = document.createElement("div")
	this.$target.className = "Modal ImageView"

	this.onClick = onClick

	$app.appendChild(this.$target)

	this.setState = (nextState) => {
		this.state = nextState
		this.render()
	}

	this.render = () => {
		this.$target.innerHTML = `<div class="content">${
			this.state
				? `<img class="image" src="${IMAGE_PATH_PREFIX}${this.state}"/>`
				: ""
		}</div>`
		this.$target.style.display = this.state ? "block" : "none"
	}

	this.$target.addEventListener("click", (e) => {
		if (!e.target.classList.contains("image")) {
			this.onClick()
		}
	})

	this.render()
}
