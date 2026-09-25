#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const EARLIER = ["pre","quel"].join("");
const LATER = ["se","quel"].join("");
const FIRST = ["ori","ginal"].join("");
const TEXT_EXTENSIONS = new Set([".css",".html",".json",".md",".mjs",".js",".xml",".yml",".yaml",".toml"]);
const ARCHIVE_PREFIXES = ["docs/references/","docs/superpowers/"];

function trackedFiles() {
  const r=spawnSync("git",["ls-files","-z"],{cwd:ROOT,encoding:"utf8"});
  if (r.error) throw r.error;
  if (r.status!==0) throw new Error((r.stderr||r.stdout||"git ls-files failed").trim());
  return r.stdout.split("\0").filter(Boolean);
}

function tokens(file){return file.toLowerCase().split(/[^a-z]+/).filter(Boolean);}
function archived(file){return ARCHIVE_PREFIXES.some(prefix=>file.startsWith(prefix));}

export function identityFindings(file,value=""){
  if (archived(file)) return [];
  const out=[];
  const pathTokens=tokens(file);
  for(const term of [EARLIER,LATER,FIRST]) if(pathTokens.includes(term)) out.push(`${file}: retired book identity appears in path`);
  const lower=value.toLowerCase();
  for(const term of [EARLIER,LATER]){
    const re=new RegExp(`\\b${term}\\b`,"g");
    let match; while((match=re.exec(lower))!==null){
      const line=value.slice(0,match.index).split("\n").length;
      out.push(`${file}:${line}: retired relative-era label appears in active content`);
    }
  }
  const structured=[
    new RegExp(`(?:data-theme|id|path|href|src|canonical_url|artifact_id)[^\\n]{0,80}${FIRST}`,"gi"),
    new RegExp(`(?:^|[/_.-])${FIRST}(?:[/_.-]|$)`,"gim"),
  ];
  for(const re of structured){
    let match; while((match=re.exec(lower))!==null){
      const line=value.slice(0,match.index).split("\n").length;
      out.push(`${file}:${line}: retired first-book implementation identity appears in active content`);
    }
  }
  return [...new Set(out)];
}

export function validateIdentities(files,read){
  const out=[];
  for(const file of files){
    const ext=path.extname(file).toLowerCase();
    const value=TEXT_EXTENSIONS.has(ext)||path.basename(file)==="README.md"?read(file):"";
    out.push(...identityFindings(file,value));
    if(out.length>=200) break;
  }
  return out.slice(0,200);
}

function main(){
  const findings=validateIdentities(trackedFiles(),file=>fs.readFileSync(path.join(ROOT,file),"utf8"));
  if(findings.length){
    console.error(`Title-identity validation failed with ${findings.length} finding(s):`);
    for(const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  console.log("Title-identity validation passed: active public surfaces use title-based book identities.");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) main();
