import { h, app } from "hyperapp"
import { Link, Route, location } from "@hyperapp/router"

const canvas = {
  height: 525 * 1.2,
  width: 370 * 1.2 * 2,
  color: "rgba(100, 100, 100, 1)",
  edgeSize: 100
}

const Home = () => (
  <div>
    <h2>Home</h2>
    <p>homeだよ</p>
  </div>
)
const About = () => (
  <h2>About</h2>
)
const Topic = ({ match }) => (
  <h2>{match.params.topicId}</h2>
)
const Edit = ({ match }) => (
  <div>
    <h2>Edit</h2>
    <PageEdit src={state.src} />
  </div>
)
const TopicsView = ({ match }) => (
  <div key="topics">
    <h3>Topics</h3>
    <ul>
      <li>
        <Link to={`${match.url}/components`}>Components</Link>
      </li>
      <li>
        <Link to={`${match.url}/single-state-tree`}>Single State Tree</Link>
      </li>
      <li>
        <Link to={`${match.url}/routing`}>Routing</Link>
      </li>
    </ul>

    {match.isExact && <h3>Please select a topic.</h3>}

    <Route parent path={`${match.path}/:topicId`} render={Topic} />
  </div>
)

const PageEdit = ({src}) => (state, actions) => (
  <div style={{
            position: "relative"
          }}>
    <div Class="edge top" style={{
           height: canvas.edgeSize + "px",
           width: "100%",
           background: canvas.color,
           position: "absolute",
           "z-index": 1
         }} />
    <div Class="edge left" style={{
           top: canvas.edgeSize,
           height: canvas.height,
           width: canvas.edgeSize,
           background: canvas.color,
           position: "absolute",
           "z-index": 1
         }} />

    <div Class="canvas" style={{
           position: "relative",
           width: canvas.width,
           height: canvas.height,
           left: canvas.edgeSize,
           top: canvas.edgeSize
         }}>
      {state.images.map((image) => (
        <img
          src={image.src}
          draggable={0}
          onmousedown={e => {
            actions.drag({
              id: image.id,
              offsetX: e.pageX - image.left,
              offsetY: e.pageY - image.top
            })
          }}
          style={{
            width: image.width + "px",
            left: image.left + "px",
            top: image.top + "px",
            cursor: "move",
            position: "absolute",
            transform: "rotate(" + image.deg + "deg)"
          }}
          />
      ))}
  </div>

    <div Class="edge right" style={{
      top: canvas.edgeSize + "px",
      height: canvas.height + "px",
      position: "absolute",
      left: canvas.width + canvas.edgeSize + "px",
      right: "0px",
      background: canvas.color,
      "z-index": 1
    }} />

    <div Class="edge bottom" style={{
      height: canvas.edgeSize + "px",
      width: "100%",
      background: canvas.color,
      position: "relative",
      "z-index": 1
    }}/>
    </div>
)

const state = {
  location: location.state,
  images: [
    {
      id: 0,
      src: "./images/curry.jpg",
      left: 0,
      top: 0,
      width: 300,
      deg: 0
    },
    {
      id: 1,
      src: "./images/curry.jpg",
      left: 0,
      top: 0,
      width: 300,
      deg: 0
    }
  ],
  dragData: {id: null, offsetX: null, offsetY: null}
}

const moveData = (state, position) => {
  if (state.dragData.id === null) return null
  const index = state.images.findIndex(i => i.id === state.dragData.id)
  return Object.assign(state.images[index], {
    left: position.x - state.dragData.offsetX,
    top: position.y - state.dragData.offsetY
  })
}

const actions = {
  location: location.actions,
  drop: () => ({dragData: {id: null}}),
  drag: (data) => ({dragData: data}),
  move: (data) => state => (moveData(state, data))
}

const view = state => (
  <div>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/about">About</Link>
      </li>
      <li>
        <Link to="/topics">Topics</Link>
      </li>
      <li>
        <Link to="/edit">Edit</Link>
      </li>
    </ul>

    <hr />

    <Route path="/" render={Home} />
    <Route path="/about" render={About} />
    <Route parent path="/topics" render={TopicsView} />
    <Route parent path="/" render={Edit} />
  </div>
)

const main = app(state, actions, view, document.body)

addEventListener("mouseup", main.drop)
addEventListener("mousemove", e => main.move({ x: e.pageX, y: e.pageY }))
addEventListener("touchend", main.drop)
addEventListener("touchmove", e => main.move({ x: e.pageX, y: e.pageY }))

const unsubscribe = location.subscribe(main.location)
