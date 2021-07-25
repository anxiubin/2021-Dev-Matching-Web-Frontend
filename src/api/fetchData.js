import { API_END_POINT } from "../constants/index.js"

const request = async (url) => {
	try {
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error("서버에 문제가 있습니다.")
		} else {
			const data = await response.json()
			return data
		}
	} catch (e) {
		throw new Error(`에러가 발생했습니다. ${e.message}`)
	}
}

export const api = {
	fetchApplication: async (nodeId) => {
		try {
			const res = await request(`${API_END_POINT}/${nodeId ? nodeId : ""}`)
			return res
		} catch (e) {
			throw new Error(`에러가 발생했습니다. ${e.message}`)
		}
	},
}
