#!/usr/bin/env node

import * as cheerio from 'cheerio'
import axios from 'axios'
import * as fs from 'node:fs'
import * as path from 'node:path'

const BASE_URL = 'https://goodfon.ru/'
const IMG_FILE_NAME = 'wallpaper'

//#region Получение ссылки на изображение с сайта

async function getData(url){
    const responce = await fetch(url)
    return cheerio.load(await responce.text())
}

async function stepOne(url){
    const $ = await getData(url)
    return $('.wallpapers > .wallpapers__item > .wallpapers__item__wall > a').first().attr('href')
}

async function stepTwo(url){
    const $ = await getData(url)
    return $('#download').attr('href')
}

async function stepThree(url){
    const $ = await getData(url)
    return $('#im > img').attr('src')
}

//#endregion

async function main(){
    const stepOneResult = await stepOne(BASE_URL)
    let stepTwoResult = await stepTwo(stepOneResult)
    const stepTwoDomain = new URL(stepOneResult).origin
    stepTwoResult = new URL(stepTwoResult, stepTwoDomain).href
    const stepThreeResult = await stepThree(stepTwoResult)
    console.log(stepThreeResult)

    const fileName = path.format({
        name: IMG_FILE_NAME,
        ext: path.extname(stepThreeResult),
    })

    const result = await axios.get(stepThreeResult, { responseType: 'arraybuffer'})
    fs.writeFileSync(fileName, result.data)
}


main();
