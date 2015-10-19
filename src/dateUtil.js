export const subtract = {
    days: (date, d) => {
        date.setDays(date.getDays() - d)
        return date
    }
    , hours: (date, h) => {
        date.setHours(date.getHours() - h)
        return date
    }
    , minutes: (date, m) => {
        date.setMinutes(date.getMinutes() - m)
        return date
    }
    , seconds: (date, s) => {
        date.setSeconds(date.getSeconds() - s)
        return date
    }
    , milliseconds: (date, ms) => {
        date.setMilliseconds(date.getMilliseconds() - ms)
        return date
    }
    , multiple: (date, config) => {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                subtract[key](date, config[key])
            }
        }
        return date
    }
}
