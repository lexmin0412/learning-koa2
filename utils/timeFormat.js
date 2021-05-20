const timeFormat = (dateObj) => {
    const str = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`
    console.log('timeFormatStr', str)
    return str
}

module.exports = timeFormat