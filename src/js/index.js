import { h, app } from "hyperapp"
import { Link, Route, location } from "@hyperapp/router"

const canvas = {
  height: 525 * 1.4,
  width: 370 * 1.4 * 2,
  color: "rgba(0, 0, 0, 0.9)",
  edgeSize: 100
}

const Home = () => (
  <div>
    <h2>Homee</h2>
    <p>IdeaZineではかんたんにZineを作ってWebで公開できるよ。ほしければ印刷もできるよ(予定)</p>
  </div>
)
const Read = () => (
  <div>
    <h2>Read</h2>
    <Page/>
  </div>
)
const Topic = ({ match }) => (
  <h2>{match.params.topicId}</h2>
)
const Edit = ({ match }) => (
  <div>
    <h2>Edit</h2>
    <p>ドラッグ&ドロップで画像を入れられるよ</p>
    <p>テキストはテキストボックスから入れてね</p>
    <Page edit={true} />
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
const Zine = () => (state, actions) => (
  <Page edit={false} />
)
const Page = ({edit}) => (state, actions) => (
  <main>
    <input type="text" value={state.inputText} oninput={e => {
        actions.setText(e.target.value)
      }}/>
      <input type="button" value="テキスト挿入" onmouseup={e => {
          actions.addText()
        }} />
    <div style={{
           position: "relative"
         }}>
      <div Class="edge top" style={{
             height: canvas.edgeSize,
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
           }}
           >
        <div style={{
               position: "absolute",
               left: canvas.width / 2,
               height: canvas.height,
               "border-right": "#AAA solid 1px",
               "z-index": 1
             }}
             />
        {state.images.map((image) => (
          <img
            src={image.src}
            draggable={0}
            onmousedown={e => {
              if (edit) {
                actions.drag({
                  id: image.id,
                  offsetX: e.pageX - image.left,
                  offsetY: e.pageY - image.top,
                  target: "images"
                })
              }
            }}
            style={{
              width: image.width,
              left: image.left,
              top: image.top,
              cursor: edit ? "move" : "init",
              position: "absolute",
              transform: "rotate(" + image.deg + "deg)"
            }}
            />
        ))
        }
  {state.texts.map((text) => (
    <p style={{
         "user-select": "none",
         "font-size": text.fontSize,
         left: text.left,
         top: text.top,
         width: text.width,
         cursor: edit ? "move" : "init",
         position: "absolute",
         transform: "rotate(" + text.deg + ")"
       }}
       onmousedown={e => {
         if (edit) {
           actions.drag({
             id: text.id,
             offsetX: e.pageX - text.left,
             offsetY: e.pageY - text.top,
             target: "texts"
           })
         }
      }}
      >
      {text.text}
    </p>
  ))}
  </div>

    <div Class="edge right" style={{
      top: canvas.edgeSize,
      height: canvas.height,
      position: "absolute",
      left: canvas.width + canvas.edgeSize,
      right: 0,
      background: canvas.color,
      "z-index": 1
    }} />

    <div Class="edge bottom" style={{
      height: canvas.edgeSize,
      top: canvas.edgeSize,
      width: "100%",
      background: canvas.color,
      position: "relative",
      "z-index": 1
    }}/>
    </div>
    </main>
)

const state = {
  location: location.state,
  pageNum: 1,
  pageMax: 4,
  texts: [],
  images: [],
  dragData: {id: null, offsetX: null, offsetY: null, target: null},
  inputText: null
}

const moveData = (state, position) => {
  if (state.dragData.id === null) return null
  const index = state[state.dragData.target].findIndex(i => i.id === state.dragData.id)
  return Object.assign(state[state.dragData.target][index], {
    left: position.x - state.dragData.offsetX,
    top: position.y - state.dragData.offsetY
  })
}

const actions = {
  location: location.actions,
  drop: () => ({dragData: {id: null}}),
  drag: (data) => ({dragData: data}),
  move: (data) => state => (moveData(state, data)),
  addImage: (src) => state => ({images: state.images.concat(
    {
      id: state.images.length,
      src: src,
      left: 0,
      top: 0,
      width: 300,
      deg: 0
    }
  )}),
  setText: (text) => state => ({inputText: text}),
  addText: () => state => ({texts: state.texts.concat(
    {
      id: state.texts.length,
      text: state.inputText,
      left: 0,
      top: 0,
      width: 200,
      fontSize: 18,
      deg: 0
    }
  )})
}

const view = state => (
  <div>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/read">Read</Link>
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
    <Route path="/read" render={Read} />
    <Route parent path="/topics" render={TopicsView} />
    <Route parent path="/" render={Edit} />
  </div>
)

const main = app(state, actions, view, document.body)

addEventListener("mouseup", main.drop)
addEventListener("mousemove", e => main.move({ x: e.pageX, y: e.pageY }))
addEventListener("touchend", main.drop)
addEventListener("touchmove", e => main.move({ x: e.pageX, y: e.pageY }))

addEventListener("drop", e => {
  e.preventDefault()
  var files = e.dataTransfer.files
  console.log(e.pageX, e.pageY)

  for(var i=0; i<files.length; i++) {
    var file = files[i]
    console.log(file)

    var reader = new FileReader()
    reader.onload = function(e) {
      var src = e.target.result
      main.addImage(src)
    }
    reader.readAsDataURL(file)
  }
})

addEventListener("dragover", e => (e.preventDefault()))

const unsubscribe = location.subscribe(main.location)
