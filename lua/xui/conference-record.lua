--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2013-2017, Seven Du <dujinfang@x-y-t.cn>
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
 * use in api_hangup_hook
 */
]]

-- print(event:serialize())

local action = event:getHeader("Action")
local record_path = event:getHeader("Path")

if action == "stop-recording" then
	local cur_dir = debug.getinfo(1).source;
	cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

	package.path = package.path .. ";/etc/xtra/?.lua"
	package.path = package.path .. ";" .. cur_dir .. "?.lua"
	package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

	require 'utils'
	require 'xtra_config'
	require 'xdb'

	if config.db_auto_connect then xdb.connect(config.fifo_cdr_dsn or config.dsn) end

	uuid = event:getHeader("Conference-Unique-ID")
	name = event:getHeader("Conference-Name")

	slash = record_path:find("/")
	record_path = record_path:sub(slash)
	filename = string.match(record_path, "^.*/(.*)$")
	ext = filename:match("^.+(%..+)$")

	local f = io.open(record_path, "rb")

	if f then
		local size = assert(f:seek("end"))

		rec = {}
		rec.name = 'conference-record-' .. name

		if ext == ".wav" then
			rec.mime = "audio/wave"
			rec.ext = "wav"
		elseif ext == ".mp4" then
			rec.mime = "video/mp4"
			rec.ext = "mp4"
		else
			rec.mime = "audio/mp3"
			rec.ext = "mp3"
		end
		rec.abs_path = record_path
		rec.file_size = "" .. size
		rec.type = "VIDEORECORD"
		rec.description = "Conference Record"
		rec.dir_path = config.recording_path
		rec.channel_uuid = uuid
		rec.original_file_name = filename
		rec.rel_path = filename

		media_file_id = xdb.create_return_id('media_files', rec)
		-- todo hook to cdrs ?
		-- xdb.update_by_cond('cdrs', {channel_uuid = uuid}, {media_file_id = media_file_id})

	else
		print("file not found " .. record_path)
	end
end
