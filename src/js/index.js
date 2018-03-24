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
    <p>ページ:{state.pageNum}/{edit ? state.pageMax : state.pages.length}</p>
    <div style={{
           display: edit ? "block" : "none"
         }}>
      <input type="text" value={state.inputText} oninput={e => {
          actions.setText(e.target.value)
        }} >
      </input>
      <input type="button" value="テキスト挿入" onmouseup={e => {
          actions.addText()
          actions.savePage()
        }} >
      </input>
    </div>

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
           }} >
        <p style={{
             "font-size": 36,
             color: "#FFF",
             width: "auto",
             margin: 30,
             cursor: "pointer",
             display: state.pageNum > 1 ? "block" : "none"
          }}
          onclick={e => {
            actions.loadPage(state.pageNum - 1)
          }}>
          ◀
        </p>
      </div>
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
            }} />
        ))}
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
    }}>
    <p style={{
      "font-size": 36,
      color: "#FFF",
      margin: 30,
      cursor: "pointer",
      display: state.pageNum < (edit ? state.pageMax : state.pages.length) ? "block" : "none"
    }}
  onclick={e => {
    actions.loadPage(state.pageNum + 1)
  }}
    >
    ▶
    </p>
    </div>

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
  inputText: null,
  pages: []
}

const existPage = (state, pageNum) => {
  const index = state.pages.findIndex(i => i.pageNum === pageNum)
  return index >= 0
}

const moveData = (state, position) => {
  if (state.dragData.id === null) return null
  const index = state[state.dragData.target].findIndex(i => i.id === state.dragData.id)
  return Object.assign(state[state.dragData.target][index], {
    left: position.x - state.dragData.offsetX,
    top: position.y - state.dragData.offsetY
  })
}

const getPageData = (state, pageNum) => {
  const index = state.pages.findIndex(i => i.pageNum === pageNum)

  return index >= 0 ? state.pages[index] : {
    pageNum: pageNum,
    images: [],
    texts: []
  }
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
  )}),
  savePage: () => state => ({pages: getUpdatedPages(state)}),
  loadPage: (pageNum) => state => (getPageData(state, pageNum))
}

const getUpdatedPages = (state) => {
  const index = state.pages.findIndex(i => i.pageNum === state.pageNum)

  const page = {
    pageNum: state.pageNum,
    images: state.images,
    texts: state.texts
  }

  var updatedPages = state.pages

  if (index < 0) {
    updatedPages.push(page)
  } else {
    updatedPages[index] = page
  }

  console.log(updatedPages)

  return updatedPages
}

const view = state => (
  <div>
    <Link to="/">
      <h1>IdeaZine</h1>
    </Link>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/read">Read</Link>
      </li>
      <li>
        <Link to="/edit">Edit</Link>
      </li>
    </ul>

    <Route path="/" render={Edit} />
    <Route path="/read" render={Read} />
    <Route path="/edit" render={Edit} />
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
      main.savePage()
    }
    reader.readAsDataURL(file)
  }
})

addEventListener("dragover", e => (e.preventDefault()))

const unsubscribe = location.subscribe(main.location)
