import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import $ from 'jquery';

var Windows = [];
const e = React.createElement;

class Button extends React.Component {
	render() {
		return (
			<button
				className={"Icon" + (this.props.className !== undefined ? " " + this.props.className : "")}
				onClick={this.props.onClick}>
			</button>
		);
	}
}

class TaskBar extends React.Component {
	render() {
		var timeNow = new Date();
		var hours = timeNow.getHours();
		var timeStr = String(hours%12)+":"+String(timeNow.getMinutes())+(hours>12?" PM":" AM");

		return (
			<div className={this.props.className}>
				<div>
					<Button className="Start9x"/>
					<div className="w9xSep1"></div>
					<div className="w9xSep2"></div>
					<div className="iconDock">
						<Button className="Start9x"/>
					</div>
					<div className="w9xSep1"></div>
					<div className="w9xSep2"></div>
					<div className="programDock">
						
					</div>
					<div className="widgetArea">
						<p>{timeStr}</p>
						{[e('p', null, "Hello"), e('p', null, "Hello2")]}
					</div>
				</div>
			</div>
		);
	}
}

class TitleBar extends React.Component {
	constructor(props) {
		super(props);

		var icon = "res/img/window/icon/welcome.png";
		if (this.props.icon)
			icon = this.props.icon;

		this.state = {
			parent: this.props.parent,
			icon: icon,
		};
	}
	render() {
		var Win = this.state.parent;
		var leftCol = this.props.parent.state.index === 0 ? "#000080" : "#808080";
		var rightCol = this.props.parent.state.index === 0 ? "#1084d0" : "#b5b5b5";
		return (
			<div className="titleBar" style={{
				width: (this.props.width-2)+'px',
				backgroundImage: "linear-gradient(to right, "+leftCol+", "+rightCol+")",
			}}>
				<img className="Icon WindowIcon" src={this.state.icon}/>
				<p style={{
					width: (this.props.width-90)+'px',
					overflow: "hidden",
				}}>
					{this.props.name}
				</p>
				<Button className="TitleButton TitleButtonClose" onClick={function(e) {
					console.log(Win.state.id, e);
					console.log(Windows);
					/* TODO: Fix this */
					//return;
					for (var i = 0; i < Windows.length; i++) {
						if (Windows[i] === null || Windows[i][3] === undefined)
							continue;
						if (Windows[i][3].state.id === Win.state.id)
							Windows[i] = null;
							//Windows.splice(i, 1);
					}
				}} />
				<Button className="TitleButton TitleButtonMax" onClick={function(e) {
					Win.state.maximized = Win.state.maximized ? false : true;
				}} />
				<Button className="TitleButton TitleButtonMin" onClick={function(e) {
					Win.state.minimized = Win.state.minimized ? false : true;
				}} />
			</div>
		);
	}
}

var iweiqwee = 0;
class WindowContent extends React.Component {
	render() {
		if (!iweiqwee) {
			console.log("props", this.props);
			iweiqwee = 1;
		}
		var className = ""
		if (!this.props.className && this.props.parent.state.index !== 0) 
			className = "noMouseEvents";
		else
			className = this.props.className;

		return (
			<div className={"WindowContent "+(className)} style={{
				height: (this.props.size.height-21)+'px',
				width: (this.props.size.width-2)+'px',
				paddingLeft: '1px'
			}}>
				{this.props.child}
			</div>
		);
	}
}

class Window extends React.Component {
	constructor(props) {
		super(props);
		var pos, size;
		if (this.props.initialPos === undefined) {
			pos = {
				x: 0,
				y: 0
			};
		} else {
			pos = this.props.initialPos;
		}
		if (this.props.initialSize === undefined) {
			size = {
				width: 300,
				height: 200
			};
		} else {
			size = this.props.initialSize;
		}
		this.state = {
			pos: pos,
			size: size,
			dragging: false,
			rel: null,
			maximized: false,
			minimized: false,
			index: this.props.index !== undefined ? this.props.index : Windows.length,
			id: this.props.id,
		};

		Windows[this.props.index][3] = this;
	}
	onMouseMove(Win, e) {
		if (!Win || !Win.state)
			return;
		if (!Win.state.dragging || Win.state.minimized) return;

		var w = ReactDOM.findDOMNode(Win).getBoundingClientRect();
		var x = e.pageX - Win.state.rel.x;
		var y = e.pageY - Win.state.rel.y;

		if (x < -w.width+20) x = -w.width+20;
		if (y < -w.height+20) y = -w.height+20;
		if (Win.state.maximized) {
			var relX = ((Win.state.rel.x+200)/(window.innerWidth+400))*Win.state.size.width;
			Win.setState({
				maximized: false,
				rel: {x: relX, y: Win.state.rel.y}
			});

		}
		Win.setState({
			pos: {
				x: x,
				y: y
			}
		});

		e.stopPropagation();
		e.preventDefault();
	}
	onMouseDown(Win, e) {
		if (!Win || !Win.state)
			return;
		for (var i = 1; i < Windows.length; i++) {
			if (Windows[i] === null || Windows[i][3] === undefined)
				continue;
			Windows[i][3].state.index += 1;
		}
		Win.state.index = 0;

		var pos = $(ReactDOM.findDOMNode(Win)).offset();
		if (e.button !== 0 || e.pageY - pos.top > 20) return;
		Win.setState({
			dragging: true,
			rel: {
				x: e.pageX - pos.left,
				y: e.pageY - pos.top
			}
		});

		e.stopPropagation();
		e.preventDefault();
	}
	onMouseUp(Win, e) {
		if (!Win || !Win.state)
			return;
		Win.setState({dragging: false})
		e.stopPropagation();
		e.preventDefault();
	}
	render() {
		if (!this || !this.state)
			return;
		var Win = this;
		var className = this.state.dragging ? "noMouseEvents" : ""
		var w, h, x, y;
		w = this.state.maximized ? window.innerWidth-4 : this.state.size.width;
		h = this.state.maximized ? window.innerHeight-4-28 : this.state.size.height;
		x = this.state.maximized ? 0 : this.state.pos.x;
		y = this.state.maximized ? 0 : this.state.pos.y;
		return (
			<div className="window" style={
					{
						position: 'absolute',
						left: x+'px',
						top: y+'px',
						width: w+'px',
						height: h+'px',
						zIndex: Windows.length-this.state.index,
						display: this.props.hidden || this.state.minimized ? "none" : "default",
					}
				}
				onMouseDown={function(e){Win.onMouseDown(Win, e)}}
				onMouseUp={function(e){Win.onMouseUp(Win, e)}}>
				<div className="w9xb1">
					<TitleBar icon={this.props.icon} parent={this} width={w} name={this.props.name}/>
					<WindowContent parent={this} className={className} size={{width: w, height: h}} child={this.props.child} />
				</div>
			</div>
		);
	}
}

// ========================================
var winElems;

var nextID = 0;
function addWindow(state, children = null) {
	if (!state)
		state = {};
	state.index = Windows.length;
	state.id = nextID++;
	console.log(children);
	Windows.push([Window, state, children]);
}

function main() {
	addWindow({hidden: true}, null);
	addWindow({
		initialSize: {width: 800, height: 600},
		name: "Hallaien",
		child: (
			<iframe
				title="Chess"
				src="https://playpager.com/embed/chess/index.html"
				scrolling="no">
			</iframe>
			)
	}, null);
	var width = 445, height = 479;
	var x = window.innerWidth/2-width/2;
	var y = window.innerHeight/2-300;
	addWindow({
		initialSize: {width: width, height: height},
		initialPos: {x: x < 0 ? 0 : x, y: y < 0 ? 0 : y},
		name: ":TheFlip:",
		child:  (
			<iframe
				title=":TheFlip:"
				width="560"
				height="315"
				src="https://www.youtube.com/embed/egYTYpleY0U"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen>
			</iframe>
			)
	}, null);
	addWindow({
		name: "Google - Microsoft Internet Explorer",
		icon: "res/img/window/icon/msie/html-5.png",
		child: (
			<iframe
				title="urmom"
				src="http://pepega.no:3000"
				scrolling="no">
			</iframe>
			)
	}, null)
	console.log(Windows);
	winElems = Windows.map((w) => {
		if (w === null)
			return null;
		else
			return e(w[0], w[1], w[2])
	});
}

function loop() {
	winElems = Windows.map((w) => {
		if (w === null)
			return null;
		else
			return e(w[0], w[1], w[2])
	});
	var taskBar = e(TaskBar, {className: "win9xTaskBar"}, null);
	ReactDOM.render(
		e('div', {id: "Base"}, 
			winElems, taskBar
		),
		document.getElementById('root')
	);
}

document.onmousemove = function(e) {
	for (var i = 0; i < Windows.length; i++) {
		if (Windows[i] === null || Windows[i][3] === undefined)
			continue;
		Windows[i][3].onMouseMove(Windows[i][3], e);
	}
};

main();
setInterval(loop, 10);