/**
 * This file contains the jQuery.timer v1.0.3 plugin.
 * 
 * Requires jQuery v1.7.2
 * 
 * @author   Gonzalo Chumillas <gonzalo@soloproyectos.com>
 * @license  https://raw.github.com/soloproyectos/jquery.timer/master/LICENSE BSD 2-Clause License
 * @link     https://github.com/soloproyectos/jquery.timer
 */
(function($) {
    var namespace = 'timer';
    
    /**
     * Timer constructor.
     * 
     * @param {Number}   delay    Delay
     * @param {Fucntion} callback Callback function
     * 
     * @return {Void}
     */
    function Timer(delay, callback) {
        /**
         * Delay in milliseconds.
         * @var {Number}
         */
        this._delay = delay;
        
        /**
         * Callback function.
         * @var {Function}
         */
        this._callback = callback;
        
        /**
         * The number of times the Timer is going to fire.
         * @var {Number}
         */
        this._maxCount = Number.POSITIVE_INFINITY;
        
        /**
         * The number of times the Timer has fired.
         */
        this._count = 0;
        
        /**
         * The time the Timer has been paused.
         * @var {Number} milliseconds
         */
        this._pausedTime = 0;
        
        /**
         * The current time.
         * @var {Number} milliseconds
         */
        this._currentTime = (new Date()).getTime();
        
        /**
         * The time elapsed from the last event or since the timer is running.
         * @var {Number} milliseconds
         */
        this._lastTime = this._currentTime;
        
        /**
         * The interval id.
         * @var {Number}
         */
        this._interval = null;
        
        /**
         * The state of the timer: 'stop', 'play' or 'pause'.
         */
        this._state = Timer.STOP;
    }
    
    /**
     * Timer states.
     */
    Timer.STOP = 'stop';
    Timer.PLAY = 'play';
    Timer.PAUSE = 'pause';
    
    /**
     * Gets the number of times the Timer has fired.
     * 
     * @return {Number}
     */
    Timer.prototype.getCount = function () {
        return this._count;
    };
    
    /**
     * Gets the delay.
     * 
     * @return {Number}
     */
    Timer.prototype.getDelay = function () {
        return this._delay;
    };
    
    /**
     * Sets a delay.
     * 
     * @param {Number} delay Delay
     * 
     * @return {Timer}
     */
    Timer.prototype.setDelay = function (delay) {
        this._delay = delay;
        
        if (this.isRunning()) {
            this.play();
        }
        
        return this;
    };
    
    /**
     * Gets the state.
     * 
     * This function returns any of the following values: 'stop', 'play' or 'pause'.
     * 
     * @return {String}
     */
    Timer.prototype.getState = function () {
        return this._state;
    };
    
    /**
     * Is the timer paused?
     * 
     * @return {Boolean}
     */
    Timer.prototype.isPaused = function () {
        return this.getState() == Timer.PAUSE;
    };
    
    /**
     * Is the timer running?
     * 
     * @return {Boolean}
     */
    Timer.prototype.isRunning = function () {
        return this.getState() == Timer.PLAY;
    };
    
    /**
     * Is the timer stopped?
     * 
     * @return {Boolean}
     */
    Timer.prototype.isStopped = function () {
        return this.getState() == Timer.STOP;
    };
    
    /**
     * Gets the current time, not counting the time it has been paused.
     * 
     * @return {Number} milliseconds
     */
    Timer.prototype.getCurrentTime = function () {
        return this.isRunning()
            ? (new Date()).getTime() - this._pausedTime
            : this._currentTime;
    };
    
    /**
     * Gets the remaining time for the next event.
     * 
     * @return {Number} milliseconds
     */
    Timer.prototype.getRemainingTime = function () {
        var t = this.getElapsedTime();
        var remainingTime = this._delay > 0
            ? Math.ceil((t + 1) / this._delay) * this._delay - t
            : 0;
        
        return remainingTime;
    };
    
    /**
     * Gets the elapsed time from the latest event.
     * 
     * @return {Number} milliseconds
     */
    Timer.prototype.getElapsedTime = function () {
        return this.getCurrentTime() - this._lastTime;
    };
    
    /**
     * Starts the timer.
     * 
     * @param {Number} count Number of times the Timer is going to fire
     * 
     * @return {Timer}
     */
    Timer.prototype.start = function (n) {
        this._maxCount = (typeof n == 'undefined')? Number.POSITIVE_INFINITY : n;
        
        this.stop();
        this.play();
        
        return this;
    };
    
    /**
     * Stops the timer.
     * 
     * @return {Timer}
     */
    Timer.prototype.stop = function () {
        clearTimeout(this._interval);
        clearInterval(this._interval);
        
        this._count = 0;
        this._pausedTime = 0;
        this._currentTime = (new Date()).getTime();
        this._lastTime = this._currentTime;
        this._state = Timer.STOP;
        
        return this;
    };
    
    /**
     * Plays the timer.
     * 
     * @param {Number} n Number of 'ticks' (not required).
     * 
     * @return {Timer}
     */
    Timer.prototype.play = function (n) {
        var self = this;
        
        if (this._maxCount > 0) {
            this.pause();
            this._interval = setTimeout(function () {
                self._lastTime = self.getCurrentTime();
                self._count++;
                self._callback.apply(self);
                
                if (self.isRunning()) {
                    self._maxCount--;
                    if (self._maxCount > 0) {
                        self._interval = setInterval(function () {
                            self._lastTime = self.getCurrentTime();
                            self._count++;
                            self._callback.apply(self);
                            
                            self._maxCount--;
                            if (self._maxCount <= 0) {
                                self.stop();
                            }
                        }, self._delay);
                    } else {
                        self.stop();
                    }
                }
            }, this.getRemainingTime());
            this._pausedTime = (new Date()).getTime() - this._currentTime;
            this._state = Timer.PLAY;
        } else {
            this.stop();
        }
        
        return this;
    };
    
    /**
     * Pauses the timer.
     * 
     * @return {Timer}
     */
    Timer.prototype.pause = function () {
        clearTimeout(this._interval);
        clearInterval(this._interval);
        
        this._currentTime = this.getCurrentTime();
        this._state = Timer.PAUSE;
        
        return this;
    };
    
    /**
     * Plays or pauses the timer.
     * 
     * @return {Timer}
     */
    Timer.prototype.toggle =  function () {
        if (this.isRunning()) {
            this.pause();
        } else {
            this.play();
        }
        
        return this;
    };
    
    /**
     * Executes the timer only one time.
     * 
     * @return {Timer}
     */
    Timer.prototype.once = function () {
        return this.start(1);
    };
    
    $[namespace] = function (delay, callback) {
        return new Timer(delay, callback);
    };
})(jQuery);
