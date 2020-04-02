'use strict'

let worldpopulation;

fetch('./worldpopulation.json')
    .then(res => res.json())
    .then(data => {
        worldpopulation = data;
    })
    .catch(err => console.error(err));

const submitBtn = document.querySelector('input[type="submit"]');
const selectElem = document.getElementById('data-select');
const countryInput = document.querySelector('input[name="countryName"]');
const dataTable = document.getElementById('data__table');
const selectCountry = document.getElementById('country-select');
const graphDiv = document.getElementById('myDiv');
const tableTitles = document.getElementById('table__titles');

const complicatedCountries = ['australia', 'canada', 'china', 'france', 'germany', 'netherlands', 'united-kingdom', 'us'];
const doubleCountries = ['Iran (Islamic Republic of)', 'Korea, South', 'Republic of Korea', 'Russian Federation', 'Taiwan*', 'Bahamas, The', '', 'Others'];

axios(`https://api.covid19api.com/countries`)
    .then(resp => {
        let output = '<option value="">--Please select a country--</option>'
        resp.data.forEach(country => {
            if (doubleCountries.findIndex(item => item === country.Country) === -1) {
                output += `<option value="${country.Slug}">${country.Country}</option>`
            }
        })
        selectCountry.innerHTML = output;
    }).catch(error => {
        console.log(error);
    });

axios(`https://api.covid19api.com/summary`)
    .then(resp => {
        const countriesDescDeathA = resp.data.Countries.sort(function (a, b) {
            return b.TotalDeaths - a.TotalDeaths
        });

        const countriesDescDeath = countriesDescDeathA.sort(function (a, b) {
            if (a.TotalDeaths === b.TotalDeaths) {
                return b.TotalConfirmed - a.TotalConfirmed
            }
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
        tableTitles.innerHTML = `<th>Country Name</th>
        <th>TotalDeaths</th>
        <th>NewDeaths</th>
        <th>Total Cases</th>
        <th>New Cases</th>
        <th>Total Recovered</th>
        <th>New Recovered</th>
        <th>TotalDeaths/1M</th>`
        let output = `<tr>
        <td>World</td>
        <td>${worldTotDeaths}</td>
        <td> + ${worldNewDeaths}</td>
        <td>${worldTotCases}</td>
        <td> + ${worldNewCases}</td>
        <td>${worldRecovered}</td>
        <td> + ${worldNewRecovered}</td>
        <td> </td>
    </tr>`;
        countriesDescDeath.forEach(country => {
            if (doubleCountries.findIndex(item => item === country.Country) === -1) {
                let countryPopulation;
                worldpopulation.forEach(item => {
                    if (item.country === country.Country) {
                        countryPopulation = +item.population;
                    }
                })
                output += `<tr>
                <td>${country.Country}</td>
                <td>${country.TotalDeaths}</td>
                <td> + ${country.NewDeaths}</td>
                <td>${country.TotalConfirmed}</td>
                <td> + ${country.NewConfirmed}</td>
                <td>${country.TotalRecovered}</td>
                <td> + ${country.NewRecovered}</td>
                <td>${(country.TotalDeaths / countryPopulation * 1000000).toFixed(2)}</td>
            </tr>`
            }
        })
        dataTable.innerHTML = output;
    }).catch(error => {
        console.log(error);
    });

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const curCountry = selectCountry.value;

    if (selectElem.value === 'summary') {
        tableTitles.innerHTML = '';
        graphDiv.innerHTML = '';
        let output = '';
        axios(`https://api.covid19api.com/summary`)
            .then(resp => {
                resp.data.Countries.forEach(country => {
                    let countryPopulation;
                    if (country.Slug === curCountry) {
                        worldpopulation.forEach(item => {
                            if (item.country === country.Country) {
                                countryPopulation = +item.population;
                            }
                        })
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
                <tr>
                    <td>TotDeaths/1M</td>
                    <td>${(country.TotalDeaths / countryPopulation * 1000000).toFixed(2)}</td>
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
                tableTitles.innerHTML = '';
                if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                } else {
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
                        font: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: 'white'
                        },
                        plot_bgcolor: "#d3d3d3",
                        paper_bgcolor: "#089595",
                        xaxis: {
                            type: 'date',
                            title: 'Date'
                        },
                        yaxis: {
                            title: 'Total Deaths'
                        },
                        title: `Total number of Covid-19 deaths in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'casesGraph') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                } else {
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
                        font: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: 'white'
                        },
                        plot_bgcolor: "#d3d3d3",
                        paper_bgcolor: "#089595",
                        xaxis: {
                            type: 'date',
                            title: 'Date'
                        },
                        yaxis: {
                            title: 'Total Cases'
                        },
                        title: `Total number of Covid-19 Cases in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'deathDay') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`) //  /dayone
            .then(resp => {
                tableTitles.innerHTML = '';
                if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                } else {
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
                        font: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: 'white'
                        },
                        plot_bgcolor: "#d3d3d3",
                        paper_bgcolor: "#089595",
                        xaxis: {
                            type: 'date',
                            title: 'Date'
                        },
                        yaxis: {
                            title: 'Number of deaths'
                        },
                        title: `Number of new Covid-19 Deaths per day ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                }

            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'casesDay') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                } else {
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
                        font: {
                            family: 'Courier New, monospace',
                            size: 18,
                            color: 'white'
                        },
                        plot_bgcolor: "#d3d3d3",
                        paper_bgcolor: "#089595",
                        xaxis: {
                            type: 'date',
                            title: 'Date'
                        },
                        yaxis: {
                            title: 'Number of Cases'
                        },
                        title: `Number of new Covid-19 Cases per day in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                }
            }).catch(error => {
                console.log(error);
            });
    }


    if (selectElem.value === 'casesDeathsGraph') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
                    .then(resp2 => {
                        tableTitles.innerHTML = '';
                        if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                            dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                        } else if (resp.data[resp.data.length - 1].Cases === 0) {
                            dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                        } else {
                            let dateTable = [];
                            let casesTable = [];
                            resp.data.forEach(day => {
                                dateTable.push(day.Date);
                                casesTable.push(day.Cases);
                            });

                            let dateTable2 = [];
                            let casesTable2 = [];
                            resp2.data.forEach(day => {
                                dateTable2.push(day.Date);
                                casesTable2.push(day.Cases);
                            });

                            dataTable.innerHTML = '';

                            var trace1 = {
                                x: dateTable,
                                y: casesTable,
                                mode: 'lines',
                                type: 'scatter',
                                name: `Cases`
                            };

                            var trace2 = {
                                x: dateTable2,
                                y: casesTable2,
                                mode: 'lines',
                                type: 'scatter',
                                name: `Deaths`
                            };

                            var data = [trace1, trace2];

                            var layout = {
                                font: {
                                    family: 'Courier New, monospace',
                                    size: 18,
                                    color: 'white'
                                },
                                plot_bgcolor: "#d3d3d3",
                                paper_bgcolor: "#089595",
                                xaxis: {
                                    type: 'date',
                                    title: 'Date'
                                },
                                yaxis: {
                                    title: 'Total Cases/Deaths'
                                },
                                title: `Total number of Covid-19 deaths/cases in ${resp.data[0].Country}`
                            };

                            Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                        }
                    })
            }).catch(error => {
                console.log(error);
            });
    }


    if (selectElem.value === 'casesDeathsDay') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
                    .then(resp2 => {
                        tableTitles.innerHTML = '';
                        if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                            dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                        } else if (resp.data[resp.data.length - 1].Cases === 0) {
                            dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                        } else {
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

                            let dateTable2 = [];
                            let casesTable2 = [];
                            resp2.data.forEach((day, index, array) => {
                                dateTable2.push(day.Date);
                                if (index > 0) {
                                    casesTable2.push(array[`${index}`].Cases - array[`${index - 1}`].Cases);
                                } else {
                                    casesTable2.push(day.Cases);
                                }
                            });

                            dataTable.innerHTML = '';

                            var trace1 = {
                                x: dateTable,
                                y: casesTable,
                                type: 'bar',
                                name: `Cases`
                            };

                            var trace2 = {
                                x: dateTable2,
                                y: casesTable2,
                                type: 'bar',
                                name: `Deaths`
                            };

                            var data = [trace1, trace2];

                            var layout = {
                                font: {
                                    family: 'Courier New, monospace',
                                    size: 18,
                                    color: 'white'
                                },
                                plot_bgcolor: "#d3d3d3",
                                paper_bgcolor: "#089595",
                                xaxis: {
                                    type: 'date',
                                    title: 'Date'
                                },
                                yaxis: {
                                    title: 'Number of Cases/Deaths'
                                },
                                title: `Number of new Covid-19 Deaths/Cases per day in ${resp.data[0].Country}`
                            };

                            Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                        }
                    }).catch(error => {
                        console.log(error);
                    });
            });
    }
});