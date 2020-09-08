import $ from "jquery";
import moment from "moment";

function main() {

    const baseUrl = "https://covid19.mathdro.id/api";
    const progress = '<div class="progress"><div class="indeterminate"></div></div>';
    const counterAnimate = {
        duration: 1500,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now).toLocaleString('en'));
        }
    };

    const yesterday = moment().subtract(1, 'days').format('M-DD-YYYY');
    
    const getCountry = () => {
        fetch(`${baseUrl}/countries`)
            .then(response => {

                return response.json();
            })
            .then(responseJson => {
                if (responseJson.error) {
                    showResponseMessage(responseJson.message);
                } else {
                    renderCountry(responseJson.countries);
                }
            })
            .catch(error => {
                showResponseMessage(error);
            })
    };

    const getData = () => {
        
        const loadingBar = $('.loading-bar');

        $.each(loadingBar, function () {
            $(this).append(progress);
        });

        fetch(`${baseUrl}`)
            .then(response => {
                $.each(loadingBar, function () {
                    $(this).children().remove();
                });
                return response.json();
            })
            .then(responseJson => {
                if (responseJson.error) {
                    showResponseMessage(responseJson.message);
                } else {
                    renderData(responseJson);
                }
            })
            .catch(error => {
                showResponseMessage(error);
            })
    };

    const renderData = (data) => {

        const lastUpdate = moment(data.lastUpdate).format("dddd, D MMMM YYYY, h:mm:ss a");

        const dataAll = {
            confirmed: data.confirmed.value,
            recovered: data.recovered.value,
            death: data.deaths.value
        }

        $('#updateGlobal').text(`Last updated at ${lastUpdate}`);

        $('#glCountConfirm').prop('Counter', 0).animate({
            Counter: dataAll.confirmed
        }, counterAnimate);

        $('#glCountRec').prop('Counter', 0).animate({
            Counter: dataAll.recovered
        }, counterAnimate);

        $('#glCountDeath').prop('Counter', 0).animate({
            Counter: dataAll.death
        }, counterAnimate);

        getDataDayBefore(yesterday, dataAll);

    }

    const renderCountry = (countries) => {
        const select = $('select');

        $.each(countries, function (index, value) {
            select.append(`<option value="${value.name}" data-icon="https://www.countryflags.io/${value.iso2}/flat/64.png">${value.name}</option>`);
        });
        select.val('Indonesia');
        M.FormSelect.init(select);
    }

    const getCountryData = (country) => {

        const loadingBarSm = $('.loading-bar-sm');

        $.each(loadingBarSm, function () {
            $(this).append(progress);
        });

        fetch(`${baseUrl}/countries/${country}`)
            .then(response => {
                $.each(loadingBarSm, function () {
                    $(this).children().remove();
                });
                return response.json();
            })
            .then(responseJson => {
                if (responseJson.error) {
                    showResponseMessage(responseJson.message);
                } else {
                    renderCountrySummary(responseJson, country);
                }
            })
            .catch(error => {
                showResponseMessage(error);
            })
    }

    const renderCountrySummary = (data, country) => {

        const lastUpdate = moment(data.lastUpdate).format("dddd, D MMMM YYYY, h:mm:ss a");

        const dataTodayCount = {
            confirmed: data.confirmed.value,
            recovered: data.recovered.value,
            death: data.deaths.value
        }

        $('#updateSummary').text(`Last updated at ${lastUpdate}`);

        $('#smCountConfirm').prop('Counter', 0).animate({
            Counter: dataTodayCount.confirmed
        }, counterAnimate);

        $('#smCountRec').prop('Counter', 0).animate({
            Counter: dataTodayCount.recovered
        }, counterAnimate);

        $('#smCountDeath').prop('Counter', 0).animate({
            Counter: dataTodayCount.death
        }, counterAnimate);

        getCountrySummaryBef(yesterday, country, dataTodayCount);

    }

    const getDataDayBefore = (day, totalToday) => {
        fetch(`${baseUrl}/daily/${day}`)
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                if (responseJson.error) {
                    showResponseMessage(responseJson.message);
                } else {
                    renderDataDayBef(responseJson, totalToday);
                }
            })
            .catch(error => {
                showResponseMessage(error);
            })
    }

    const renderDataDayBef = (data, totalToday) => {
        
        const confirmedDayBef = [];
        const recoveredDayBef = [];
        const deadDayBef = [];

        $.each(data, function (index, value) {
            confirmedDayBef.push(parseInt(value.confirmed));
            recoveredDayBef.push(parseInt(value.recovered));
            deadDayBef.push(parseInt(value.deaths));
        });

        // global 
        const confirmed = totalToday.confirmed - confirmedDayBef.reduce(sumFunc);
        const recovered = totalToday.recovered - recoveredDayBef.reduce(sumFunc);
        const death = totalToday.death - deadDayBef.reduce(sumFunc);
        
        $('#globalConfirmYest').text(`+${confirmed} since yesterday`);
        $('#globalRecovYest').text(`+${recovered} cured today`);
        $('#globalDeadYest').text(`+${death} today`);

    }

    const getCountrySummaryBef = (day, country, dataTodayCount) => {

        fetch(`${baseUrl}/daily/${day}`)
            .then(response => {
                return response.json();
            })
            .then(responseJson => {
                if (responseJson.error) {
                    showResponseMessage(responseJson.message);
                } else {
                    renderDataCountryBef(responseJson, country, dataTodayCount);
                }
            })
            .catch(error => {
                showResponseMessage(error);
            })
    }

    const renderDataCountryBef = (data, country, dataTodayCount) => {

        let confirmedDayBef = [];
        let recoveredDayBef = [];
        let deadDayBef = [];

        $.each(data, function (index, value) {

            if (value.countryRegion == country) { 
                confirmedDayBef.push(parseInt(value.confirmed));
                recoveredDayBef.push(parseInt(value.recovered));
                deadDayBef.push(parseInt(value.deaths));
            }
            else{
                confirmedDayBef.push(0);
                recoveredDayBef.push(0);
                deadDayBef.push(0);
            }
        });

        const confirmed = dataTodayCount.confirmed - confirmedDayBef.reduce(sumFunc);
        const recovered = dataTodayCount.recovered - recoveredDayBef.reduce(sumFunc);
        const death = dataTodayCount.death - deadDayBef.reduce(sumFunc);

        $('#countryConfirmYest').text(`+${confirmed} since yesterday`);
        $('#countryRecYest').text(`+${recovered} cured today`);
        $('#countryDeadYest').text(`+${death} today`);
    }

    function sumFunc(a, b) {
        return a + b;
    }

    document.addEventListener('DOMContentLoaded', function () {

        $("#refresh").click(function(){
            getData();
        });

        $("#refresh-sm").click(function(){
            getCountryData($('#countryInput').val());
        });

        getData();
        getCountry();

        $('#countrySummary').text('Indonesia');
        getCountryData('Indonesia');
        

    });

    document.getElementById('countryInput').addEventListener('change', function() {

        $('#countrySummary').text(this.value);
        getCountryData(this.value);
    });

}

export default main;