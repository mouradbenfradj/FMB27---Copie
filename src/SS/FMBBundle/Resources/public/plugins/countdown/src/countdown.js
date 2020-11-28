var defaultOptions = {
    date: "June 7, 2087 15:03:25",
    refresh: 1000,
    offset: 0,
    onEnd: function () {
        return;
    },
    render: function (date) {
        this.el.innerHTML = date.years + " years, " +
            date.days + " days, " +
            this.leadingZeros(date.hours) + " hours, " +
            this.leadingZeros(date.min) + " min and " +
            this.leadingZeros(date.sec) + " sec";
    }
};

/**
 * Countdown constructor
 * @param {HTMLElement} el      DOM node of the countdown
 * @param {Object}      options (optional) Options for the plugin
 */
var Countdown = function (el, options) {

    /**
     * Reference to the DOM element
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Options of the countdown plugin
     * @type {Object}
     */
    this.options = {};

    /**
     * Interval reference or false if counter is stopped
     * @type {Mixed}
     */
    this.interval = false;

    // merge default options and options into this.options
    for (var i in defaultOptions) {
        if (defaultOptions.hasOwnProperty(i)) {
            this.options[i] = typeof options[i] !== 'undefined' ? options[i] : defaultOptions[i];

            if (i === 'date' && typeof this.options.date !== 'object') {
                this.options.date = new Date(this.options.date);
            }

            // bind context for functions
            if (typeof this.options[i] === 'function') {
                this.options[i] = this.options[i].bind(this);
            }
        }
    }

    /**
     * Get the difference between now and the end date
     * @return {Object} Object with the diff information (years, days, hours, min, sec, millisec)
     */
    this.getDiffDate = function () {
        var diff = (this.options.date.getTime() - Date.now() + this.options.offset) / 1000;

        var dateData = {
            years: 0,
            days: 0,
            hours: 0,
            min: 0,
            sec: 0,
            millisec: 0
        };

        if (diff <= 0) {
            if (this.interval) {
                this.stop();
                this.options.onEnd();
            }
            return dateData;
        }

        if (diff >= (365.25 * 86400)) {
            dateData.years = Math.floor(diff / (365.25 * 86400));
            diff -= dateData.years * 365.25 * 86400;
        }

        if (diff >= 86400) {
            dateData.days = Math.floor(diff / 86400);
            diff -= dateData.days * 86400;
        }

        if (diff >= 3600) {
            dateData.hours = Math.floor(diff / 3600);
            diff -= dateData.hours * 3600;
        }

        if (diff >= 60) {
            dateData.min = Math.floor(diff / 60);
            diff -= dateData.min * 60;
        }

        dateData.sec = Math.round(diff);

        dateData.millisec = diff % 1 * 1000;

        return dateData;
    }.bind(this);

    /**
     * Add leading zeros to a number
     * @param  {Number} num    Input number
     * @param  {Number} length Length of the desired output
     * @return {String}        String of the desired length with leading zeros
     */
    this.leadingZeros = function (num, length) {
        length = length || 2;
        num = String(num);
        if (num.length > length) {
            return num;
        }
        return (Array(length + 1).join('0') + num).substr(-length);
    };

    /**
     * Update the end date of the countdown
     * @param  {Mixed}     newDate Date object or a String/Number that can be passed to the Date constructor
     * @return {Countdown}         Countdown instance
     */
    this.update = function (newDate) {
        if (typeof newDate !== 'object') {
            newDate = new Date(newDate);
        }
        this.options.date = newDate;
        this.render();
        return this;
    }.bind(this);

    /**
     * Stop the countdown refresh / rerender
     * @return {Countdown} Countdown instance
     */
    this.stop = function () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = false;
        }
        return this;
    }.bind(this);

    /**
     * Render the countdown
     * @return {Countdown} Countdown instance
     */
    this.render = function () {
        this.options.render(this.getDiffDate());
        return this;
    }.bind(this);

    /**
     * Start the countdown
     * @return {Countdown} Countdown instance
     */
    this.start = function () {
        // don't start if the countdown is already started
        if (this.interval) {
            return;
        }

        this.render();

        if (this.options.refresh) {
            this.interval = setInterval(this.render, this.options.refresh);
        }

        return this;
    }.bind(this);

    /**
     * Update the offset
     * @param  {Number}    offset New offset in ms
     * @return {Countdown}        Countdown instance
     */
    this.updateOffset = function (offset) {
        this.options.offset = offset;
        return this;
    }.bind(this);


    // initial start of the countdown or initial render
    this.start();
};

module.exports = Countdown;
