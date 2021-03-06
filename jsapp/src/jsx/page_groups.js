/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
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
 * Mariah Yang <yangxiaojin@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Col } from 'react-bootstrap';
import Select from 'react-select';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools'

class GroupMembers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {members: [], danger: false, select_value: [],
			select_users: [], users: [], max: 0, startsort: 0, userlist: false
		};
		this.handleDragSortStart = this.handleDragSortStart.bind(this);
		this.handleDragSortDrop = this.handleDragSortDrop.bind(this);
		this.setChooseValue = this.setChooseValue.bind(this);
		this.handleClearSelect = this.handleClearSelect.bind(this);
		this.handleShowUserList = this.handleShowUserList.bind(this);
	}

	handleGetGroupMembers() {
		xFetchJSON("/api/groups/" + this.props.group_id + "/members").then((data) => {
			let max = this.state.max;
			if(data.length) {
				max = data[0].sort;
				data.map((d) => {
					max = max < d.sort ? d.sort : max;
				})
			} else {
				max = 0;
			}

			this.setState({members: data, max: max});
		});
	}

	handleGetReaminMembers() {
		xFetchJSON("/api/groups/" + this.props.group_id + "/remain_members?realm=" + this.props.realm).then((data) => {
			this.setState({users: data});
		}).catch((msg) => {
			console.log("get remain users ERR", msg);
		});
	}

	handleMembersAdded() {
		const group_id = this.props.group_id;

		let members = this.state.select_users.map(function(select) {
			return {group_id: group_id, user_id: select.id}
		});

		members = JSON.stringify(members);
		console.log("xxx members", members);

		xFetchJSON("/api/groups/members", {
			method: "POST",
			body: members
		}).then((obj) => {
			this.handleGetGroupMembers();
			this.handleGetReaminMembers();
			this.setState({select_value: [], select_users: []});
		}).catch((msg) => {
			console.error("member", msg);
		});
	}

	handleSelectChange(value) {
		console.log("xxx select_value", value);
		this.setState({select_value: value});
	}

	handleDelete(e) {
		e.preventDefault();

		var user_id = e.target.getAttribute("data-id");
		console.log("deleting id", user_id);

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/groups/members/" + this.props.group_id + "/" + user_id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var members = this.state.members.filter(function(m) {
				return m.user_id != user_id;
			});

			this.setState({members: members});
			this.handleGetReaminMembers();
			this.handleGetGroupMembers();

		}).catch((msg) => {
			console.error("groups member ", msg);
		});
	}

	handleDeleteMembers(e) {

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/groups/members/" + this.props.group_id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			this.handleGetGroupMembers();
			this.handleGetReaminMembers();

		}).catch((msg) => {
			console.error("groups members ", msg);
		});
	}

	componentDidMount() {
		this.handleGetGroupMembers();
		this.handleGetReaminMembers();
	}

	handleDragSortStart (e) {
		let startsort = e.target.parentNode.getAttribute("value");
		this.state.startsort = startsort;
	}

	handleDragSortDrop (e) {
		e.preventDefault();
		const _this = this;
		let row = e.target.parentNode;
		row.setAttribute('style', 'border-top: 1px solid #ddd; background-color: #fff');
		let startsort = parseInt(this.state.startsort);
		let dropsort = parseInt(row.getAttribute("value"));

		xFetchJSON("/api/groups/drag/" + startsort + "/" + dropsort, {
			method: "PUT"
		}).then((obj) => {
			_this.handleGetGroupMembers();
		}).catch((msg) => {
			console.error("group", msg);
			this.setState({errmsg: '' + msg + ''});
		}); 
	}

	handleDragSortEnter(e) {
		let row = e.target.parentNode;
		row.setAttribute('style', 'border: 2px dashed #3f3f3f; background-color: #f5f5f5');
	}

	handleDragSortOver(e) {
		e.preventDefault();
	}

	handleDragSortLeave (e) {
		let row = e.target.parentNode;
		row.setAttribute('style', 'border: 0; background-color: #fff');
	}

	setChooseValue (e, user) {
		const _this = this;
		console.log("xxx target", e.target);
		console.log("xxx target", e.target.checked);
		let select_users = this.state.select_users;
		if(user == "all") {
			select_users = [];
			if(e.target.checked) {
				_this.state.users.map((u) => {
					select_users.push({id: u.id, name: u.name, extn: u.extn});
				})
			}
		} else {
			if(e.target.checked) {
				select_users.push({id: user.id, name: user.name, extn: user.extn});
			} else {
				select_users = select_users.filter((suser) => {
					return suser.id != user.id;
				})
			}
		}
		console.log("xxxx select_users", select_users);
		this.setState({select_users: select_users})
	}

	handleClearSelect () {
		this.setState({select_users: []});
	}

	handleShowUserList () {
		this.setState({userlist: !this.state.userlist})
	}

	render() {
		const toggleDanger = () => this.setState({ danger: !this.state.danger });
		const danger = this.state.danger ? "danger" : null;
		const member_options = this.state.users.map(function(member) {
			return {label: member.name + "|" + member.extn, value: member.id}
		});

		const _this = this;
		var members = this.state.members.map(function(member) {
			return <tr key={member.id} value={member.id}>
					<td draggable={"true"} style={{cursor: "pointer"}}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}>{member.sort}</td>
					<td draggable={"true"} style={{cursor: "pointer"}}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}><Link to={`/settings/users/${member.user_id}`}>{member.extn}</Link></td>
					<td draggable={"true"} style={{cursor: "pointer"}}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}>{member.name}</td>
					<td draggable={"true"} style={{cursor: "pointer"}}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop}>{member.domain}</td>
					<td draggable={"true"} style={{cursor: "pointer"}}
						onDragStart={_this.handleDragSortStart}
						onDragEnter={_this.handleDragSortEnter.bind(this)}
						onDragLeave={_this.handleDragSortLeave.bind(this)}
						onDragOver={_this.handleDragSortOver.bind(this)} 
						onDrop={_this.handleDragSortDrop} style={{textAlign: "right"}}>
						<T.a onClick={_this.handleDelete.bind(_this)} data-id={member.user_id} text="Delete" className={danger} href="#"/>
					</td>
			</tr>;
		})

		return <div>
			<h2><T.span text="Group Members"/></h2><br/>
			<ButtonToolbar>
				<div style={{position: "relative"}}>
					<div>
						<div style={{border: "1px solid #ccc", maxWidth: "350px", minWidth: "160px", borderRadius: "4px", color: "#333", display: "inline-table", height: "36px", margin: "5px"}}>
							<div style={{maxWidth: "300px", minWidth: "160px", lineHeight: "34px"}}>
							{
								this.state.select_users.length == 0 ? <span style={{fontSize: "14px", color: "#999", padding: "3px"}}>请选择用户</span> :
									_this.state.select_users.map((user, index) => {
										return <div key={index} style={{borderRadius: "2px", border: "1px solid #b9d9ff", backgroundColor: "#edf5ff", color: "#007eff", display: "inline-block", fontSize: "0.9em", lineHeight: "1.4", marginLeft: "5px", marginTop: "5px", verticalTop: "top"}}>
											<span style={{padding: "2px 5px"}}>{user.name}|{user.extn}</span>
										</div>
									})
							}
							</div>
							<span style={{cursor: "pointer", width: "17px", fontSize: "16px", color: "#999", display: "table-cell", verticalAlign: "middle", textAlign: "center"}}
								onMouseOver={(e) => {e.target.style.color = "red"}}
								onMouseLeave={(e) => {e.target.style.color = "#999"}}
								onClick={_this.handleClearSelect}>x</span>
							<div style={{cursor: "pointer", width: "25px", fontSize: "18px", color: "#999", display: "table-cell", verticalAlign: "middle", textAlign: "center", paddingRight: "5px"}}
								onClick={_this.handleShowUserList}>
								<i className="fa fa-caret-down"></i>
							</div>
						</div>
						<Button bsStyle="primary" onClick={this.handleMembersAdded.bind(this)}>{T.translate("Add Member(s)")}</Button>
					</div>
					<div style={{display: _this.state.userlist ? "block" : "none",height: "188px", width: "175px", border: "1px solid #ccc", overflowY: "auto", padding: "0 10px", position: "relative", top: "-5px", left: "5px", borderTop: 0, width: "200px"}}>
						<Checkbox onClick={(e) => {_this.setChooseValue(e, "all")}}>全选</Checkbox>
						{
							this.state.users.map((user, index) => {
								let tmp= "";
								_this.state.select_users.map((val, inde) => {
									if(val.id == user.id) tmp = val.id;
								})
								return <Checkbox checked={user.id == tmp} key={user.id} onClick={(e) => {_this.setChooseValue(e, user)}}>
									<div>{user.name} | {user.extn}</div>
							    </Checkbox>
							})
						}
					</div>
				</div>

			{/*	<Select style={{ minWidth:"160px", maxWidth:"300px"}} name="multi-select"
					multi={true} className="pull-left" value={this.state.select_value}
					placeholder={T.translate('Please Select')} options={member_options}
					onChange={this.handleSelectChange.bind(this)}/>*/}

				<Button bsStyle="danger" className="pull-right" onClick={this.handleDeleteMembers.bind(this)}>{T.translate("Remove All Member(s)")}</Button>
			</ButtonToolbar>
			<br/>
			<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Sort"/></th>
					<th><T.span text="Number" data="k"/></th>
					<th><T.span text="Name"/></th>
					<th><T.span text="Domain"/></th>
					<th style={{textAlign: "right"}}>
						<T.span style={{cursor: "pointer"}} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/>
					</th>
				</tr>
				{members}
				</tbody>
			</table>
		</div>
	}
}

class NewGroup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var group = form2json('#newGroupForm');
		let max = this.props.max;

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		if(group.group_id == ''){
			group.sort = parseInt(max) + 1;
		}

		xFetchJSON("/api/groups", {
			method: "POST",
			body: JSON.stringify(group)
		}).then((obj) => {
			group.id = obj.id;
			this.props.handleNewGroupAdded(group);
		}).catch((msg) => {
			console.error("group", msg);
			this.setState({errmsg: '' + msg + ''});
		}); 
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewGroupAdded;
		const the_group_options = this.props.group_options;
		delete props.group_options;

		const group_options = the_group_options.map(function(option){
			let text = option.name.replace(/ /g, String.fromCharCode(160))
			return <option key={option.value} value={option.value}>{text}</option>
		});

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Group" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newGroupForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" /></Col>
				</FormGroup>

				<FormGroup controlId="formParentGroup">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Parent Group"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="group_id">
							<option value=""></option>
							{ group_options }
						</FormControl>
					</Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="realm" /></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><FormControl type="input" name="description" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class GroupPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {group: {}, edit: false, permissions: [], group_options: []};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handlePermissions = this.handlePermissions.bind(this);
	}

	handleGetGroupOptionsTree() {
		xFetchJSON("/api/groups/build_group_options_tree/" + this.props.params.id).then((data) => {
			this.setState({group_options: data});
		}).catch((e) => {
			console.log("get group_options ERR");
		});
	}

	handleSubmit(e) {
		var group = form2json('#newGroupForm');

		if (!group.name || !group.realm) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		if (group.group_id == '') {
			group.group_id = null;
		}

		xFetchJSON("/api/groups/" + group.id, {
			method: "PUT",
			body: JSON.stringify(group)
		}).then(() => {
			xFetchJSON("/api/groups/" + this.props.params.id).then((data) => {
				this.setState({group: data, edit: false});
			}).catch((e) => {
				console.log("get group ERR");
			});
			this.handleGetGroupOptionsTree();
			notify(<T.span text={{key:"Saved at", time: Date()}}/>);
		}).catch(() => {
			console.error("group", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	handlePermissions(e) {
		var group_id = this.state.group.id;
		var permission_id = e.target.value;
		if (e.target.checked) {
			var gtype = "POST";
		} else {
			var gtype = "DELETE";
		}
		xFetchJSON("/api/permissions", {
			method: gtype,
			body: '{"permission_id":"'+permission_id+'","group_id":"'+group_id+'"}'
		}).then((data) => {
			console.error("www", data);
		}).catch((msg) => {
			console.error("err", msg);
		});
	}

	componentDidMount() {
		xFetchJSON("/api/groups/" + this.props.params.id).then((data) => {
			this.setState({group: data});
		}).catch((e) => {
			console.log("get group ERR");
		});

		xFetchJSON("/api/permissions/" + this.props.params.id).then((data) => {
			this.setState({permissions: data});
		}).catch((e) => {
			console.log("get permissions ERR");
		});

		this.handleGetGroupOptionsTree();
	}

	render() {
		const group = this.state.group;

		const group_options = this.state.group_options.map(function(option) {
			return [option.value, option.name.replace(/ /g, String.fromCharCode(160))];
		});


		group_options.unshift(["", ""]);

		let save_btn = "";
		let err_msg = "";

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		var permissions = this.state.permissions.map(function(row) {
			return <Checkbox key="row" name="permissions" defaultChecked={row.checkshow} value={row.id}><T.span text="action:"/><T.span text={row.action}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="type:"/><T.span text={row.method}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<T.span text="param:"/><T.span text={row.param}/></Checkbox>
		})
		return <div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Groups"/></h1>
			<hr/>

			<Form horizontal id="newGroupForm">
				<input type="hidden" name="id" defaultValue={group.id}/>

				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={group.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formRealm">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Realm" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="realm" defaultValue={group.realm}/></Col>
				</FormGroup>

				<FormGroup controlId="formParentGroup">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Parent Group"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} componentClass="select" name="group_id" options={group_options} defaultValue={group.parent_name}/></Col>
				</FormGroup>

				<FormGroup controlId="formDescription">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Description" /></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="description" defaultValue={group.description}/></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>

			<br/>
			<FormGroup onChange={this.handlePermissions}>
				<Col componentClass={ControlLabel} sm={2}><T.span text="Permissions"/></Col>
				<Col sm={10}>{permissions}</Col>
			</FormGroup>
			<br/>
			<hr/>
			{group.id ? <GroupMembers group_id={group.id} realm={group.realm}/> : null}

		</div>
	}
}

class GroupsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false,
				formShow1: false, group_options: [], max: 0,
				floder_gid: {}, child_id_arr: []
			};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleUnFolder = this.handleUnFolder.bind(this);
	}

	handleControlClick(data) {
		if (data == "new") {
			this.setState({ formShow: true});
		} else if (data == "import") {
			this.setState({ formShow1: true});
		};
	}

	handleDelete(id) {

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));
			if (!c) return;
		}

		xFetchJSON("/api/groups/" + id, {
				method: "DELETE"
			}).then(() => {
				console.log("deleted")
				this.handleGetGroupsTree();
				this.handleGetGroupOptionsTree();
			}).catch((msg) => {
				var c = confirm(T.translate("Can't Delete Because The Child Group Exist!"));
				if (!c) return;
			});
	}

	handleGetGroupOptionsTree() {
		xFetchJSON("/api/groups/build_group_options_tree").then((data) => {
			this.setState({group_options: data});
		}).catch((e) => {
			console.log("get group_options ERR");
		});
	}

	handleGetGroupsTree() {
		xFetchJSON("/api/groups/build_group_tree").then((data) => {
			let max = this.state.max;
			if(data.length) {
				max = data[0].sort;
				data.map((d) => {
					if(d.level == 0) {
						max = max < d.sort ? d.sort : max;
					}
				})
			} else {
				max = 0;
			}

			this.setState({rows: data, max: max});
		}).catch((e) => {
			console.log("get group_tree ERR");
		});
	}

	componentDidMount() {
		this.handleGetGroupsTree();
		this.handleGetGroupOptionsTree();
	}

	handleGroupAdded(group) {
		this.handleGetGroupsTree();
		this.setState({formShow: false});
		this.handleGetGroupOptionsTree();
	}

	handleUnFolder(e) {
		let icon = e.currentTarget;
		let level = e.currentTarget.getAttribute("data-level");
		let tid = e.currentTarget.getAttribute("data-id");
		let floder_gid = this.state.floder_gid;
		this.state.child_id_arr = [];
		this.pickChildGroup([tid]);
		floder_gid[tid] = floder_gid[tid] == "undefined" ? false : !floder_gid[tid];
		icon.className = floder_gid[tid] ? "fa fa-minus-square-o" : "fa fa-plus-square-o";
		this.state.child_id_arr.map((id) => {
			floder_gid[id] = floder_gid[tid];
		})

		this.setState({floder_gid: floder_gid})
		this.state.floder_gid = floder_gid;	
	}

	pickChildGroup(arr) {
		let _this = this;
		if(!arr.length) return;
		let id_arr = [];
		if(arr.length > 0) {
			this.state.rows.map(function(row) {
				arr.map((id) => {
					if(row.group_id == id) {
						_this.state.child_id_arr.push(row.id);
						id_arr.push(row.id);
					}
				})
			})
			this.pickChildGroup(id_arr);
		}
	}

	render() {
		let formClose = () => this.setState({ formShow: false });
		let formClose1 = () => this.setState({ formShow1: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
	    var danger = this.state.danger ? "danger" : "";
	    let floder_gid = this.state.floder_gid;

		var _this = this;
		var rows = this.state.rows.map((row) => {
			if(floder_gid[row.group_id] == undefined) floder_gid[row.group_id] = true;
			return <tr key={row.id} style={{display: floder_gid[row.group_id] ? "table-row" : "none"}}>
					<td>{row.spaces.replace(/ /g, String.fromCharCode(160))}
						<i data-id={row.id} data-level={row.level} className="fa fa-minus-square-o" aria-hidden="true" style={{cursor: "pointer"}} onClick={_this.handleUnFolder}></i>&nbsp;&nbsp;&nbsp;
						<Link to={`/settings/groups/${row.id}`}>{row.name}</Link>
					</td>
					<td>{parseInt(row.level)+1}-<span>{row.sort}</span></td>
					<td>{row.realm}</td>
					<td>{row.description}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id, row)} text="Delete" className={danger} style={{cursor: 'pointer'}}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
				<Button onClick={() => this.handleControlClick("new")}>
					<i className="fa fa-plus" aria-hidden="true" onClick={() => this.handleControlClick("new")}></i>&nbsp;
					<T.span onClick={() => this.handleControlClick("new")} text="New" />
				</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Groups"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="Name"/></th>
					<th><T.span text="Sort"/></th>
					<th><T.span text="Realm"/></th>
					<th><T.span text="Description"/></th>
					<th><T.span text="Delete" className={danger} onClick={toggleDanger} style={{cursor: 'pointer'}} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewGroup show={this.state.formShow} max={this.state.max} onHide={formClose} handleNewGroupAdded={this.handleGroupAdded.bind(this)} group_options={this.state.group_options}/>
		</div>
	}
}

export {GroupsPage, GroupPage};
