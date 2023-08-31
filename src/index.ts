import { Context, Schema } from "koishi";

import fs from "fs";

export const name = "maipi-bot";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
	ctx.middleware(async (session, next) => {
		var response = getResponse(session);
		if (response != null)	
      session.send(response);
		return next();
	});
}

const STATE_FILE = "./state.json";
let arcades = [];
const EMPTY_STATE = [
	{
		keywords: ["东百", "利桥", "超乐"],
		peopleCount: 0,
		updatedBy: "maipi",
    lastUpdatetAt: new Date().toLocaleTimeString(),
	},
	{
		keywords: ["万达", "清万", "大玩家"],
		peopleCount: 0,
		updatedBy: "maipi",
    lastUpdatetAt: new Date().toLocaleTimeString(),
	},
];

const getCountKeywords = '几人';

function getResponse(session) {
  arcades = readState();
  let returnMessage = null;
	arcades.forEach((arcade) => {
		arcade.keywords.forEach((keyword) => {
			if (session.content.includes(keyword)) {
        if (session.content.includes(keyword + getCountKeywords)) {
          returnMessage = 
            keyword + "当前有" + arcade.peopleCount.toString() + "人" + 
            "\n" + "最后更新时间: " + arcade.lastUpdatetAt.toString() + 
            "\n" + "最后更新人: " + arcade.updatedBy;
        }
          
			  updateArcadePeopleCount(session, arcade, keyword);
      }
		});
	});
  saveState();
  return returnMessage;
}

function updateArcadePeopleCount(session, arcade, keyword) {
	if (!checkValidUpdateMessage(session.content, keyword)) 
    return false;
	let operator = getOperator(session.content);
	let number = +session.content.replace(/^\D+/g, "");
	if (operator == "+") 
    arcade.peopleCount += number;
	else if (operator == "-") 
    arcade.peopleCount -= number;
	else 
    arcade.peopleCount = number;
  arcade.updatedBy = session.userId;
  arcade.lastUpdatetAt = new Date().toLocaleTimeString();
	return true;
}

function checkValidUpdateMessage(content, keyword) {
  content = content.replace(" ", "");
	content = content.replace(keyword, "");
	if (!isNaN(content.charAt(0)) || content.charAt(0) == '+' || content.charAt(0) == '-' ) 
    return true;
	else 
    return false;
}

function getOperator(content) {
	if (content.includes("+")) return "+";
	else if (content.includes("-")) return "-";
	else return null;
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(EMPTY_STATE, null, 2));
  }
  return JSON.parse(fs.readFileSync(STATE_FILE).toString());
}

function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(arcades, null, 2));
}