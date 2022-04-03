import fs from "fs";
import HTMLParser from "node-html-parser";
import { fileExists } from "../../tutorial-toptal/shared/fs-util";

export function replaceHtmlVariables(tokens: string[], filePath: string) {
  const tmpInFilePath = filePath.split(".").slice(0, -1).join(".") + ".html";
  const tmpInFilePath2 = filePath.split(".").slice(0, -2).join(".") + ".html";
  let htmlFilePath;

  if (fileExists(tmpInFilePath)) {
    htmlFilePath = tmpInFilePath;
  } else if (fileExists(tmpInFilePath2)) {
    htmlFilePath = tmpInFilePath2;
  }
  if (htmlFilePath) {
    const root = HTMLParser(fs.readFileSync(htmlFilePath).toString());
    const allElements = root.querySelectorAll("*");
    tokens.forEach((token) => {
      allElements.forEach((elem) => {
        const attrEntries = Object.entries(elem.attrs);
        const newToken = "$ctrl." + token;
        for (let [key, value] of attrEntries) {
          if (
            value.includes(token) &&
            !value.includes(newToken) &&
            (!limitedAttrs[token] || limitedAttrs[token] === key) &&
            token !== attrTokenEdgeCaseMap[key]
          ) {
            elem.setAttribute(key, replaceAll(value, token, newToken));
          }
        }
        const textToReplace = elem.structuredText.trim();
        if (
          elem.childNodes.length === 1 &&
          elem.firstChild.constructor.name === "TextNode" &&
          textToReplace.includes(token) &&
          !textToReplace.includes(newToken) &&
          textToReplace.includes("{{")
        ) {
          const open = textToReplace.split("{{");
          const close = open[1].split("}}");
          const replaced = replaceAll(close[0], token, newToken);
          elem.textContent = `${open[0]}{{ ${replaced} }}${close[1]}`;
        }
      });
    });
    fs.writeFileSync(htmlFilePath, root.outerHTML);
  }
}

const attrTokenEdgeCaseMap = {
  class: "label",
  "ng-model": "controller",
  "ng-if-inside": "id",
};

const limitedAttrs = {
  id: "id",
};

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
