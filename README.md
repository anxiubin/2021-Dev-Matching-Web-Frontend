# 2021 Dev Matching 웹 프론트엔드 과제

문제 출처: https://programmers.co.kr/skill_check_assignments/100

## 🖥 Get Started

webpack 으로 개발환경 구축

```
npm run build
npm run start
```

## ✅ 구현 기능

- [상태 기반의 렌더링](#상태-기반의-렌더링)
- [컴포넌트의 독립성](#컴포넌트의-독립성)
- [API 호출 함수 분리](#api-호출-함수-분리)
- [데이터 캐싱](#데이터-캐싱)
- [이벤트 위임](#이벤트-위임)

### 상태 기반의 렌더링

React.js 의 렌더링 방식과 같이, 상태값이 변경될 때마다 화면을 렌더링하는 방식으로 구현했습니다.

```js
export default function Lists({ $app, initialState }) {
	this.state = initialState

	//해당 컴포넌트가 생성되는 시점에 element를 생성하고 렌더링
	this.$target = document.createElement("ul")
	this.$target.className = "Lists"
	$app.appendChild(this.$target)

	//현재 컴포넌트의 state를 변경하고 리렌더링하는 함수
	this.setState = (nextState) => {
		this.state = nextState
		this.render()
	}

	//현재 컴포넌트의 state 기반 렌더링 함수
	this.render = () => {
		this.$target.innerHTML = `
      <li>this is list</li>`
	}

	this.render()
}
```

### 컴포넌트의 독립성

독립적인 컴포넌트를 유지하되 특정 인터랙션에 의해 여러 컴포넌트에 영향을 주어야 할 경우, 상위 컴포넌트에서 콜백함수를 파라미터로 넘기는 것을 통해 각각의 컴포넌트를 제어합니다.

```js
//App.js

export default function App($app) {
	this.state = {
		depth: [],
	}

	const breadcrumb = new Breadcrumb({
		$app,
		initialState: this.state.depth,
		onClick: (index) => {
            //생략
		},
	})
	const nodes = new Nodes({
		$app,
		initialState: {
			nodes: this.state.nodes,
		},
		onClick: async (node) => {
			try {
				if (node.type === DIRECTORY) {
                    const nextNodes = await request(node.id)

                    //Breadcrumb 인스턴스와 관련된 depth를 여기서 처리해도 state가 함께 업데이트 되므로 서로 컴포넌트의 의존성을 줄일 수 있습니다.
                    this.setState({
                        ...this.state,
                        depth: [...this.state.depth, node],
                    })
                }
			} catch (e) {
				throw new Error(`에러가 발생했습니다. ${e.message}`)
			}
		}
	})
```

### API 호출 함수 분리

API 호출 함수는 컴포넌트 내에서 선언하지 않고, 별도로 분리하여 재사용성을 높이고 관심사를 분리합니다.

```js
//fetchData.js

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
```

### 데이터 캐싱

최상위 컴포넌트인 App.js에서 모든 컴포넌트를 제어하고 있으므로, App.js에서 데이터를 캐싱할 객체를 생성합니다.

```js
//App.js

const cache = {}

//...코드 생략

const nodes = new Nodes({
		$app,
		initialState: {
			isRoot: this.state.isRoot,
			nodes: this.state.nodes,
		},
		onClick: async (node) => {
			try {
				if (node.type === DIRECTORY) {

                    //캐싱된 데이터가 있다면 캐싱된 데이터를 렌더링
					if (cache[node.id]) {
						this.setState({
							...this.state,
							depth: [...this.state.depth, node],
							isRoot: false,
							nodes: cache[node.id],
						})
					} else {
						const nextNodes = await api.fetchApplication(node.id)
						this.setState({
							...this.state,
							depth: [...this.state.depth, node],
							isRoot: false,
							nodes: nextNodes,
						})

                        //캐싱된 데이터가 없다면 현재 데이터를 cache 객체에 업데이트하여 캐싱
						cache[node.id] = nextNodes
					}
				}
			} catch (e) {
				throw new Error(`에러가 발생했습니다. ${e.message}`)
			}
		},

```

### 이벤트 위임

동적으로 element를 생성하고 각각 event listener를 생성하는 것은 메모리 사용 측면과 event 관리 측면에서 좋지 않습니다. 따라서 이벤트 위임(event delegation) 기법을 사용하여 이를 해결합니다.

```js
//Nodes.js

//... 코드 생략
this.$target.addEventListener("click", (e) => {
	// 모든 Node element를 순회하면서 이벤트를 걸지 않아도 됩니다.
	const $node = e.target.closest(".Node")
	if ($node) {
		const { nodeId } = $node.dataset
		if (!nodeId) {
			this.onBackClick()
			return
		}
		const selectedNode = this.state.nodes.find((node) => node.id === nodeId)
		if (selectedNode) {
			this.onClick(selectedNode)
		}
	}
})
```
