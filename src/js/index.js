import { h, app } from "hyperapp"
import { Link, Route, location } from "@hyperapp/router"

const PAGE_MAX = 10
const CANVAS_RATE = 0.9

const canvas = {
  height: 841 * CANVAS_RATE,
  width: 594 * CANVAS_RATE * 2,
  color: "rgba(0, 0, 0, 0.9)",
  edgeSize: 100
}

const zines = ["phigasui", "curry", "tokuyama"]

const Home = () => (
  <div>
    <h2>Home</h2>
    <p>IdeaZineではかんたんにZineを作ってWebで公開できるよ。ほしければ印刷もできるよ(予定)</p>
  </div>
)

const Collection = () => (
  <div style={{
         display: "table"
       }} >
    {zines.map((zine) => (
      <ZineCover zineName={zine} />
    ))}
  </div>
)

const ZineCover = ({zineName}) => (state, actions) => (
  <Link to="/read">
    <div style={{
           display: "table-cell",
           width: 300,
           border: "1px solid #ddd",
           "border-radius": "10px",
           cursor: "pointer"
         }}
         onclick={e => {
           actions.loadState(zineName+".json")
      }} >
      <img style={{
             width: 200,
             padding: 30,
             "margin-left": "auto",
             "margin-right": "auto"
           }}
           src={"./images/"+zineName+".png"} />
    </div>
  </Link>
)

const DownloadpPages = (state) => (
  <div>
    <h2>DownloadPage</h2>
    <input type="button" onclick={() => {
        const element = document.getElementsByClassName('canvas')[0];

        html2pdf(element, {
          margin:       1,
          filename:     'myfile.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { dpi: 192, letterRendering: true },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
      }} />
    {state.pages.map((page) => {
        console.log(page)
    })}
  </div>
)

const Read = () => (state, actions) => (
  <div>
    <h2>Read</h2>
    <Link to="/edit">Edit</Link>
    <Page edit={false} />
  </div>
)
const Topic = ({ match }) => (
  <h2>{match.params.topicId}</h2>
)
const Edit = ({ match }) => (state, actions) => (
  <div>
    <h2>Edit</h2>
    <p>ドラッグ&ドロップで画像を入れられるよ</p>
    <p>テキストはテキストボックスから入れてね</p>
    <a download={true}
       href={
         (
           "data:text/json;charset=utf-8,"
             + encodeURIComponent(JSON.stringify(state.pages))
         )
       } >
      JSONダウンロード
    </a>
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
const Page = ({edit, page}) => (state, actions) => (
  <main>
    <p>ページ:{page ? page.pageNum : state.pageNum}/{edit ? PAGE_MAX : state.pages.length}</p>
    <div style={{
           display: edit ? "block" : "none"
         }}>
      <textarea value={state.inputText} oninput={e => {
          actions.setText(e.target.value)
        }} >
      </textarea>
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
           }} >
        <p style={{
             color: "#FFF",
             display: edit && state.pageNum == 1 ? "block" : "none"
           }} >
          カバーになるページです。◀裏表紙----表紙▶です。お気をつけください。
        </p>
      </div>
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
             display: (page ? page.pageNum : state.pageNum) > 1 ? "block" : "none"
          }}
          onclick={e => {
            actions.loadPage((page ? page.pageNum : state.pageNum) - 1)
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
           }} >
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
                if (state.selected.object == "image" && state.selected.id == image.id) {
                  actions.unselect()
                } else {
                  actions.select({
                    object: "image",
                    id: image.id
                  })
                }
              }
            }}
            style={{
              width: image.width,
              left: image.left,
              top: image.top,
              cursor: edit ? "move" : "init",
              position: "absolute",
              transform: "rotate(" + image.deg + "deg)",
              border: state.selected.object == "image" && state.selected.id == image.id ? "2px solid #ddd" : 0
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
         transform: "rotate(" + text.deg + ")",
         border: state.selected.object == "text" && state.selected.id == text.id ? "2px solid #ddd" : 0
       }}
       onmousedown={e => {
         if (edit) {
           actions.drag({
             id: text.id,
             offsetX: e.pageX - text.left,
             offsetY: e.pageY - text.top,
             target: "texts"
           })
           if (state.selected.object == "text" && state.selected.id == text.id) {
             actions.unselect()
           } else {
             actions.select({
               object: "text",
               id: text.id
             })
           }
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
      display: (page ? page.pageNum : state.pageNum) < (edit ? PAGE_MAX : state.pages.length) ? "block" : "none"
    }}
  onclick={e => {
    actions.loadPage((page ? page.pageNum : state.pageNum) + 1)
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
  texts: [],
  images: [],
  dragData: {id: null, offsetX: null, offsetY: null, target: null},
  inputText: null,
  pages: [],
  selected: {
    object: null,
    id: null
  }
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
  select: (data) => ({selected: data}),
  unselect: () => ({selected: {object: null, id: null}}),
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
  loadPage: (pageNum) => state => (getPageData(state, pageNum)),
  keyType: (key) => state => (getUpdatedStateByKey(state, key)),
  loadState: (file) => (state, actions) => {loadJSON(file, actions)},
  setState: (data) => state => (data),
  init: () => state => ({pages: [], texts: [], images: [], pageNum: 1})
}

const loadJSON = (file, actions) => {
  console.log("loading")
  fetch("./data/"+file, {mode: 'cors'})
    .then(data => data.json())
    .then(data => {
      actions.setState({
        pageNum: 1,
        pages: data,
        images: data[0].images,
        texts: data[0].texts
      })
    })
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

  return updatedPages
}

const getUpdatedStateByKey = (state, key) => {
  const object = state.selected.object + 's'
  const objectId = state.selected.id

  var updatedState = state

  if (objectId == null) {return updatedState}


  if (!['d', 'k', 'j', 'u', 'l'].find(k => k == key)) {
    return updatedState
  }

  const index = state[object].findIndex(i => i.id == objectId)

  if (key == 'd') {
    console.log(index)
    updatedState[object].splice(index, 1)
  } else if (key == 'k') {
    updatedState[object][index].width += 1
  } else if (key == 'j') {
    updatedState[object][index].width -= 1
  } else if (key == 'u') {
    updatedState[object][index].fontSize += 1
  } else if (key == 'l') {
    updatedState[object][index].fontSize -= 1
  }

  return updatedState
}

const view = (state, actions) => (
  <div>
    <Link to="/" style={{
            "text-decoration": "none"
          }}>
      <h1>IdeaZine</h1>
    </Link>
    <div style={{
           "border-collapse": "separate",
           "border-spacing": 8
         }}>
      <Link to="/">
        <span style={{
                display: "table-cell",
                width: 110,
                height: 68,
                "vertical-align": "middle",
                "border-style": "solid",
                "border-width": 1.5,
                "border-color": "rgba(0,0,0,0.8)",
                "border-radius": "10px",
                "text-align": "center"
              }} >Home</span>
      </Link>
      <Link to="/collection">
        <span style={{
                display: "table-cell",
                width: 110,
                height: 68,
                "vertical-align": "middle",
                "border-style": "solid",
                "border-width": 1.5,
                "border-color": "rgba(0,0,0,0.8)",
                "border-radius": "10px",
                "text-align": "center"
              }}>Collection</span>
      </Link>
      <Link to="/edit">
        <span style={{
                display: "table-cell",
                width: 110,
                height: 68,
                "vertical-align": "middle",
                "border-style": "solid",
                "border-width": 1.5,
                "border-color": "rgba(0,0,0,0.8)",
                "border-radius": "10px",
                "text-align": "center"
              }}
              onclick={e => (actions.init())}
              >Create</span>
      </Link>
    </div>

    <Route path="/" render={Collection} />
    <Route path="/read" render={Read} />
    <Route path="/edit" render={Edit} />
    <Route path="/collection" render={Collection} />
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

  for(var i=0; i<files.length; i++) {
    var file = files[i]

    var reader = new FileReader()
    reader.onload = function(e) {
      var src = e.target.result
      main.addImage(src)
      main.savePage()
    }
    reader.readAsDataURL(file)
  }
})

addEventListener("keypress", e => {
  main.keyType(e.key)
  main.savePage()
})

addEventListener("dragover", e => (e.preventDefault()))

const unsubscribe = location.subscribe(main.location)
