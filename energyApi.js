const energyURL = 'https://ausrealtimefueltype.global-roam.com/api/SeriesSnapshot';

class Energy {
    constructor(url) {
        url = url || energyURL; // defaults to energyURL if url is not defined

        this.source = url;
        this.data = {};
        this.lastUpdate = new Date(0);
        this.states = {};

        this.update();
    }

    update() {

        return new Promise((resolve, reject) => {
            this.ready = false;
            let req = new XMLHttpRequest();
            req.open("GET", this.source, true);
            req.onload = (() => {
                if (req.status >= 200 && req.status < 400) {
                    this.data = JSON.parse(req.responseText);
                    this._update();
                    resolve();
                    this.ready = true;
                }
            }).bind(this);
            req.onerror = reject;
            req.send();
        });
    }

    _update() {
        this.lastUpdate = new Date(Date.parse(this.data.timeStamp || ""));

        let series = this.data.seriesCollection || [];

        for (let i = 0; i < series.length; i++) {
            let state = series[i].metadata.region.id;
            let fuel = series[i].metadata.fuelType.name;

            this.states[state] = this.states[state] || {}; // Ensures that states[state] exists first
            this.states[state][fuel] = series[i].value;
        }
    }

    get NSW() {
        return this.states.NSW;
    }
    get QLD() {
        return this.states.QLD;
    }
    get VIC() {
        return this.states.VIC;
    }
    get SA() {
        return this.states.SA;
    }
    get TAS() {
        return this.states.TAS;
    }
    get WA() {
        return this.states.WA;
    }

}

Energy.recommendedDelay = 30000;
