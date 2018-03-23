import { h, app } from "hyperapp"
import { Link, Route, location } from "@hyperapp/router"

const canvas = {
  height: 525 * 1.2,
  width: 370 * 1.2 * 2,
  color: "rgba(100, 100, 100, 1)"
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
    <PageEdit imagePath={state.imagePath} />
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

const PageEdit = ({imagePath}) => (state, actions) => (
  <div style={{
         position: "relative",
         left: "100px"
       }}>
    <div style={{
           position: "absolute",
           height: "100px",
           left: "-110px",
           right: "0px",
           background: canvas.color,
           "z-index": 1
         }}/>
    <div style={{
           position: "absolute",
           top: "100px",
           height: canvas.height + "px",
           width: "110px",
           left: "-110px",
           background: canvas.color,
           "z-index": 1
         }}/>
    <div style={{
           position: "absolute",
           top: "100px",
           height: canvas.height + "px",
           right: "0px",
           left: canvas.width + "px",
           background: canvas.color,
           "z-index": 1
         }}/>
    <div style={{
           position: "absolute",
           top: 100 + canvas.height + "px",
           height: "100px",
           left: "-110px",
           right: "0px",
           background: canvas.color,
           "z-index": 1
         }}/>
    <img
      src={imagePath}
      draggable={0}
      onmousedown={e => {
        actions.drag({
          x: e.pageX,
          y: e.pageY,
          offset: {
            x: e.pageX - state.left,
            y: e.pageY - state.top
          }
        })
      }}
      ontouchstart={e => {
        actions.drag({
          x: e.pageX,
          y: e.pageY,
          offset: {
            x: e.pageX - state.left,
            y: e.pageY - state.top
          }
        })
      }}
      style={{
        width: state.width + "px",
        height: state.height + "px",
        left: state.left + "px",
        top: state.top + 100 + "px",
        cursor: "move",
        position: "absolute"
      }}
      />
  </div>
)

const state = {
  location: location.state,
  imagePath: "./images/curry.jpg",
  dragging: false,
  offset: {
    x: 0,
    y: 0
  },
  left: 0,
  top: 0,
  width: 300,
  height: null
}

const actions = {
  location: location.actions,
  drop: () => ({ dragging: false }),
  drag: (data) => Object.assign(data, { dragging: true }),
  move: (data) => state => (
    state.dragging && Object.assign(
      data,
      {
        left: data.x - state.offset.x,
        top: data.y - state.offset.y
      }
    )
  )
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
