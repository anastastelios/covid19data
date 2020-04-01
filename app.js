'use strict'


const submitBtn = document.querySelector('input[type="submit"]');
const selectElem = document.getElementById('data-select');
const countryInput = document.querySelector('input[name="countryName"]');
const dataTable = document.getElementById('data__table');
const selectCountry = document.getElementById('country-select');
const graphDiv = document.getElementById('myDiv');

axios(`https://api.covid19api.com/countries`)
    .then(resp => {
        let output = '<option value="">--Please select a country--</option>'
        console.log(resp.data);
        resp.data.forEach(country => {
            output += `<option value="${country.Slug}">${country.Country}</option>`
        })
        selectCountry.innerHTML = output;
    }).catch(error => {
        console.log(error);
    });

axios(`https://api.covid19api.com/summary`)
    .then(resp => {
        const countriesDescDeath = resp.data.Countries.sort(function (a, b) {
            return b.TotalDeaths - a.TotalDeaths
        });
        let worldTotDeaths = 0;
        let worldNewDeaths = 0;
        let worldTotCases = 0;
        let worldNewCases = 0;
        let worldRecovered = 0;
        let worldNewRecovered = 0;
        countriesDescDeath.forEach(country => {
            worldTotDeaths += country.TotalDeaths;
            worldNewDeaths += country.NewDeaths;
            worldTotCases += country.TotalConfirmed;
            worldNewCases += country.NewConfirmed;
            worldRecovered += country.TotalRecovered;
            worldNewRecovered += country.NewRecovered;
        })
        let output = `<tr>
        <td>Country Name</td>
        <td>TotalDeaths</td>
        <td>NewDeaths</td>
        <td>Total Cases</td>
        <td>New Cases</td>
        <td>Total Recovered</td>
        <td>New Recovered</td>
    </tr>
    <tr>
        <td>World</td>
        <td>${worldTotDeaths}</td>
        <td> + ${worldNewDeaths}</td>
        <td>${worldTotCases}</td>
        <td> + ${worldNewCases}</td>
        <td>${worldRecovered}</td>
        <td> + ${worldNewRecovered}</td>
    </tr>`;
        countriesDescDeath.forEach(country => {
            output += `<tr>
            <td>${country.Country}</td>
            <td>${country.TotalDeaths}</td>
            <td> + ${country.NewDeaths}</td>
            <td>${country.TotalConfirmed}</td>
            <td> + ${country.NewConfirmed}</td>
            <td>${country.TotalRecovered}</td>
            <td> + ${country.NewRecovered}</td>
        </tr>`
        })
        dataTable.innerHTML = output;
    }).catch(error => {
        console.log(error);
    });

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const curCountry = selectCountry.value;
    console.log(curCountry);

    if (selectElem.value === 'summary') {
        graphDiv.innerHTML = '';
        let output = '';
        axios(`https://api.covid19api.com/summary`)
            .then(resp => {
                resp.data.Countries.forEach(country => {
                    if (country.Slug === curCountry) {
                        output += `
                        <tr>
                        <td>Country Name</td>
                        <td>${country.Country}</td>
                    </tr>
                    <tr>
                    <td>Total Deaths</td>
                    <td>${country.TotalDeaths}</td>
                </tr>
                <tr>
                    <td>New Deaths</td>
                    <td> + ${country.NewDeaths}</td>
                </tr>
                <tr>
                    <td>Total Cases</td>
                    <td>${country.TotalConfirmed}</td>
                </tr>
                <tr>
                    <td>New Cases</td>
                    <td> + ${country.NewConfirmed}</td>
                </tr>
                <tr>
                    <td>Total Recovered</td>
                    <td>${country.TotalRecovered}</td>
                </tr>
                <tr>
                    <td>New Recovered</td>
                    <td> + ${country.NewRecovered}</td>
                </tr>
                        `;
                    }
                });
                dataTable.innerHTML = output;

            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'deathGraph') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                console.log(resp.data);
                let dateTable = [];
                let casesTable = [];
                resp.data.forEach(day => {
                    dateTable.push(day.Date);
                    casesTable.push(day.Cases);
                });

                dataTable.innerHTML = '';

                var trace1 = {
                    x: dateTable,
                    y: casesTable,
                    mode: 'lines',
                    type: 'scatter',
                    name: `${curCountry}`
                };

                var data = [trace1];

                var layout = {
                    xaxis: {
                        type: 'date',
                        title: 'Date'
                    },
                    yaxis: {
                        title: 'Total Deaths'
                    },
                    title: `Total number of Covid-19 deaths in ${curCountry}`
                };

                Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'casesGraph') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                console.log(resp.data);
                let dateTable = [];
                let casesTable = [];
                resp.data.forEach(day => {
                    dateTable.push(day.Date);
                    casesTable.push(day.Cases);
                });

                dataTable.innerHTML = '';

                var trace1 = {
                    x: dateTable,
                    y: casesTable,
                    mode: 'lines',
                    type: 'scatter',
                    name: `${curCountry}`
                };

                var data = [trace1];

                var layout = {
                    xaxis: {
                        type: 'date',
                        title: 'Date'
                    },
                    yaxis: {
                        title: 'Total Cases'
                    },
                    title: `Total number of Covid-19 Cases in ${curCountry}`
                };

                Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'deathDay') {
        axios(`https://api.covid19api.com/dayone/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                console.log(resp.data);
                let dateTable = [];
                let casesTable = [];
                resp.data.forEach((day, index, array) => {
                    dateTable.push(day.Date);
                    if (index > 0) {
                        casesTable.push(array[`${index}`].Cases - array[`${index - 1}`].Cases);
                    } else {
                        casesTable.push(day.Cases);
                    }
                });

                dataTable.innerHTML = '';

                var trace1 = {
                    x: dateTable,
                    y: casesTable,
                    type: 'bar',
                    name: `${curCountry}`
                };

                var data = [trace1];

                var layout = {
                    xaxis: {
                        type: 'date',
                        title: 'Date'
                    },
                    yaxis: {
                        title: 'Number of deaths'
                    },
                    title: `Number of new Covid-19 Deaths per day ${curCountry}`
                };

                Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'casesDay') {
        axios(`https://api.covid19api.com/dayone/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                console.log(resp.data);
                let dateTable = [];
                let casesTable = [];
                resp.data.forEach((day, index, array) => {
                    dateTable.push(day.Date);
                    if (index > 0) {
                        casesTable.push(array[`${index}`].Cases - array[`${index - 1}`].Cases);
                    } else {
                        casesTable.push(day.Cases);
                    }
                });

                dataTable.innerHTML = '';

                var trace1 = {
                    x: dateTable,
                    y: casesTable,
                    type: 'bar',
                    name: `${curCountry}`
                };

                var data = [trace1];

                var layout = {
                    xaxis: {
                        type: 'date',
                        title: 'Date'
                    },
                    yaxis: {
                        title: 'Number of Cases'
                    },
                    title: `Number of new Covid-19 Cases per day ${curCountry}`
                };

                Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
            }).catch(error => {
                console.log(error);
            });
    }
});

// submitBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     const country = countryInput.value;
//     console.log(country);

//     if (selectElem.value === 'summary') {
//         axios(`https://api.covid19api.com/country/${country.toLowerCase()}/status/confirmed`)
//             .then(resp => {
//                 console.log(resp.data[resp.data.length - 1].Cases);
//             }).catch(error => {
//                 console.log(error);
//             });
//     }
// });
