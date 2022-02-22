import fetch from 'node-fetch'
import fs from 'fs'
const endpoint = 'https://gnehs.github.io/ntut-course-crawler-node/'

//https://stackoverflow.com/questions/8495687/split-array-into-chunks
Object.defineProperty(Array.prototype, 'chunk', {
    value: function (n) {
        let ceil = Math.ceil;
        return Array.from(Array(ceil(this.length / n)), (_, i) => this.slice(i * n, i * n + n));
    }
});
let pool = []
let sitemapUrls = {}
async function getCourseList(year, sem) {
    let courses = await fetch(`${endpoint}${year}/${sem}/main.json`)
        .then(res => res.json())
        .then(res => res.map(x => x.id))
    console.log(`${year}/${sem}`)
    for (let id of courses) {
        sitemapUrls[`${year}/${sem}`].push(`https://ntut-course.gnehs.net/course/${year}/${sem}/${id}`)
    }
}
let mainData = await fetch(`${endpoint}main.json`).then(res => res.json())
for (let [year, sems] of Object.entries(mainData)) {
    for (let sem of sems) {
        sitemapUrls[`${year}/${sem}`] = []
        pool.push(getCourseList(year, sem))
    }
}
await Promise.all(pool)
//save file
sitemapUrls = Object.entries(sitemapUrls).map(([k, v]) => v).flat()
sitemapUrls.chunk(50000).forEach((chunk, index) => {
    fs.writeFileSync(`sitemap-${index + 1}.txt`, chunk.join('\n'), { encoding: 'utf8' })
})
console.log(`${sitemapUrls.length} urls saved`)