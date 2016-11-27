/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import { Link } from 'react-router';

class NewUser extends React.Component {
	propTypes: {handleNewUserAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.last_id = 0;
		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var user = form2json('#newUserForm');
		console.log("user", user);

		if (!user.extn || !user.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/users",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(user),
			success: function () {
				_this.last_id++;
				user.id = "NEW" + _this.last_id;
				_this.props["data-handleNewUserAdded"](user);
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	render() {
		console.log(this.props);

		return <Modal {...this.props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New User" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newUserForm">
				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="extn" placeholder="1000" /></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="route_to_beijing" /></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Password" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="password" name="password" placeholder="a$veryComplicated-Passw0rd" /></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="VM Password"/></Col>
					<Col sm={10}><FormControl type="password" name="vm_password" placeholder="12345678900" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context" /></Col>
					<Col sm={10}><FormControl type="input" name="context" defaultValue="default"/></Col>
				</FormGroup>

				<FormGroup controlId="formCidName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Name"/></Col>
					<Col sm={10}><FormControl type="input" name="cid_name" placeholder="1000" /></Col>
				</FormGroup>

				<FormGroup controlId="formLength">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" /></Col>
					<Col sm={10}><FormControl type="input" name="cid_number" placeholder="11" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}><T.span text="Save" /></Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>Close</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class EditControl extends FormControl {
	constructor(props) {
		super(props);
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.edit;

		if (this.props.edit) {
			return <FormControl {...props} />
		}

		return <span>{props.defaultValue}</span>
	}

}

class UserPage extends React.Component {
	propTypes: {handleNewUserAdded: React.PropTypes.func}

	constructor(props) {
		super(props);

		this.state = {errmsg: '', user: {}, edit: false};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var user = form2json('#newUserForm');
		console.log("user", user);

		if (!user.extn || !user.name) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/users/" + user.id,
			headers: {"X-BROWSER-METHOD": "PUT"},
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(user),
			success: function () {
				_this.setState({user: user, errmsg: {key: "Saved at", time: Date()}})
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/users/" + this.props.params.id, "", function(data) {
			console.log("user", data);
			_this.setState({user: data});
		}, function(e) {
			console.log("get users ERR");
		});
	}

	render() {
		const user = this.state.user;
		let save_btn = "";

		if (this.state.edit) {
			save_btn = <T.button type="button" onClick={this.handleSubmit} text="Save"/>
		}

		return <div>
			<ButtonGroup className="controls">
				<T.span text={this.state.errmsg} className="danger"/>&nbsp;&nbsp;
				{ save_btn }
				<T.button onClick={this.handleControlClick} text="Edit"/>
			</ButtonGroup>

			<h1>{user.extn}</h1>

			<Form horizontal id="newUserForm">
				<input type="hidden" name="id" defaultValue={user.id}/>
				<FormGroup controlId="formExtn">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Number" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="extn" defaultValue={user.extn}/></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={user.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formPassword">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Password" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="password" defaultValue={user.password} type="password"/></Col>
				</FormGroup>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="VM Password"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="vm_password" defaultValue={user.vm_password} type="password" /></Col>
				</FormGroup>

				<FormGroup controlId="formContext">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Context" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="context" defaultValue={user.context}/></Col>
				</FormGroup>

				<FormGroup controlId="formCidName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Name"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_name" defaultValue={user.cid_name}/></Col>
				</FormGroup>

				<FormGroup controlId="formLength">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_number" defaultValue={user.cid_number}/></Col>
				</FormGroup>
			</Form>
		</div>
	}
}

class UsersPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		$.ajax({
			type: "DELETE",
			url: "/api/users/" + id,
			success: function () {
				console.log("deleted")
				var rows = _this.state.rows.filter(function(row) {
					return row.id != id;
				});

				_this.setState({rows: rows});
			},
			error: function(msg) {
				console.error("route", msg);
			}
		});
	}

	handleClick(x) {
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
		var _this = this;
		$.getJSON("/api/users", "", function(data) {
			console.log("users", data)
			_this.setState({rows: data});
		}, function(e) {
			console.log("get users ERR");
		});
	}

	handleFSEvent(v, e) {
	}

	handleUserAdded(route) {
		var rows = this.state.rows;
		rows.push(route);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/users/${row.id}`}>{row.extn}</Link></td>
					<td>{row.name}</td>
					<td>{row.context}</td>
					<td>{row.domain}</td>
					<td>{row.type}</td>
					<td>{row.cid_name}</td>
					<td>{row.cid_number}</td>
					<td><T.a onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>;
		})

		return <div>
			<div className="controls">
				<T.button onClick={this.handleControlClick} data="new" text="New" />
			</div>

			<h1><T.span text="Users"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Number"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Context"/></th>
					<th><T.span text="Domain"/></th>
					<th><T.span text="Type"/></th>
					<th><T.span text="CID Name"/></th>
					<th><T.span text="CID Number"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewUser show={this.state.formShow} onHide={formClose} data-handleNewUserAdded={this.handleUserAdded.bind(this)}/>
		</div>
	}
}

export {UsersPage, UserPage};
