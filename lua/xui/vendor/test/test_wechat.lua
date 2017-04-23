print("test start ... \n")

local cur_dir = debug.getinfo(1).source;
cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/vendor)/test/test_wechat.lua$", "%1")
package.path = package.path .. ";" .. cur_dir .. "/?.lua"
package.path = package.path .. ";" .. cur_dir .. "/../model/?.lua"

stream:write(package.path)
stream:write("test start\n")

require 'xdb'
require 'xwechat'
require 'm_dict'
require 'xtra_config'
require 'utils'

if config.db_auto_connect then xdb.connect(config.dsn) end

local wechat = m_dict.get_obj('WECHAT')

print(xwechat.access_token('sipsip'))

token = xwechat.get_token('sipsip', wechat.APPID, wechat.APPSEC)
print(token)

-- xwechat.get_callback_ip()

print(xwechat.sign('sipsip', "a", "b", "c"))

stream:write("test done\n")
