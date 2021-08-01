import Breadcrumb from "./components/Breadcrumb.js"
import Nodes from "./components/Nodes.js"
import ImageView from "./components/ImageView.js"
import Loading from "./components/Loading.js"
import { FILE, DIRECTORY } from "./constants/index.js"
import { api } from "./api/fetchData.js"

const cache = {}

export default function App($app) {
	// 상태값
	this.state = {
		isRoot: true,
		nodes: [],
		depth: [],
		selectedFilePath: null,
		isLoading: false,
	}

	// 상태값 변경 함수
	this.setState = (nextState) => {
		this.state = nextState
		breadcrumb.setState(this.state.depth)
		nodes.setState({
			isRoot: this.state.isRoot,
			nodes: this.state.nodes,
		})
		imageView.setState(this.state.selectedFilePath)
		loading.setState(this.state.isLoading)
	}

	// 생성자 함수 실행
	const breadcrumb = new Breadcrumb({
		$app,
		initialState: this.state.depth,
		onClick: (index) => {
			if (index === null) {
				this.setState({
					...this.state,
					depth: [],
					isRoot: true,
					nodes: cache.root,
				})
				return
			}

			if (index === this.state.depth.length - 1) {
				return
			}

			const nextState = { ...this.state }
			const nextDepth = this.state.depth.slice(0, index + 1)

			this.setState({
				...nextState,
				depth: nextDepth,
				nodes: cache[nextDepth[nextDepth.length - 1].id],
			})
		},
	})
	const nodes = new Nodes({
		$app,
		initialState: {
			isRoot: this.state.isRoot,
			nodes: this.state.nodes,
		},
		onClick: async (node) => {
			try {
				if (node.type === DIRECTORY) {
					if (cache[node.id]) {
						this.setState({
							...this.state,
							depth: [...this.state.depth, node],
							isRoot: false,
							nodes: cache[node.id],
						})
					} else {
						this.setState({
							...this.state,
							isLoading: true,
						})

						const nextNodes = await api.fetchApplication(node.id)
						this.setState({
							...this.state,
							depth: [...this.state.depth, node],
							isRoot: false,
							nodes: nextNodes,
						})
						cache[node.id] = nextNodes
					}
				} else if (node.type === FILE) {
					this.setState({
						...this.state,
						selectedFilePath: node.filePath,
					})
				}
			} catch (e) {
				throw new Error(`에러가 발생했습니다. ${e.message}`)
			} finally {
				this.setState({
					...this.state,
					isLoading: false,
				})
			}
		},
		onBackClick: async () => {
			try {
				const nextState = { ...this.state }
				nextState.depth.pop()

				const prevNodeId =
					nextState.depth.length === 0
						? null
						: nextState.depth[nextState.depth.length - 1].id

				if (prevNodeId === null) {
					this.setState({
						...nextState,
						isRoot: true,
						nodes: cache.root,
					})
				} else {
					this.setState({
						...nextState,
						isRoot: false,
						nodes: cache[prevNodeId],
					})
				}
			} catch (e) {
				throw new Error(`에러가 발생했습니다. ${e.message}`)
			}
		},
	})
	const imageView = new ImageView({
		$app,
		initialState: this.state.selectedFilePath,
		onClick: () => {
			this.setState({
				...this.state,
				selectedFilePath: null,
			})
		},
	})
	const loading = new Loading({
		$app,
		initialState: this.state.isLoading,
	})

	// 최초 앱 실행 시 초기화
	const init = async () => {
		try {
			this.setState({
				...this.state,
				isLoading: true,
			})

			const rootNodes = await api.fetchApplication()
			this.setState({
				...this.state,
				isRoot: true,
				nodes: rootNodes,
			})
			cache["root"] = rootNodes
		} catch (e) {
			throw new Error(`에러가 발생했습니다. ${e.message}`)
		} finally {
			this.setState({
				...this.state,
				isLoading: false,
			})
		}
	}

	init()
}
