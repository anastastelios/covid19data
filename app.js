'use strict'

let worldpopulation;

const submitBtn = document.querySelector('button[type="submit"]');
const selectElem = document.getElementById('data-select');
const countryInput = document.querySelector('input[name="countryName"]');
const dataTable = document.getElementById('data__table');
const selectCountry = document.getElementById('country-select');
const graphDiv = document.getElementById('myDiv');
const tableTitles = document.getElementById('table__titles');
const spinner = document.getElementById('spinner');
const comparisonDetails = document.getElementById('comparison__details');
const about = document.getElementById('about');

const complicatedCountries = ['australia', 'canada', 'china', 'france', 'germany', 'netherlands', 'united-kingdom', 'united-states', 'cuba'];
const extraComplicatedCountries = [];
const doubleCountries = ['Iran (Islamic Republic of)', 'Korea, South', 'Republic of Korea', 'Taiwan*', 'Bahamas, The', '', 'Others', 'Republic of the Congo', 'The Bahamas'];
const usedCountries = [];

axios(`https://api.covid19api.com/countries`)
    .then(resp => {
        const countriesAlpha = resp.data.sort(function (a, b) {
            if (a.Country < b.Country) { return -1; }
            if (a.Country > b.Country) { return 1; }
            return 0;
        });
        let output = '<option value="">--Please select a country--</option>'
        countriesAlpha.forEach(country => {
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

        fetch('./worldpopulation.json')
            .then(res => res.json())
            .then(data => {
                worldpopulation = data;

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
                    if (doubleCountries.findIndex(item => item === country.Country) === -1) {
                        worldTotDeaths += country.TotalDeaths;
                        worldNewDeaths += country.NewDeaths;
                        worldTotCases += country.TotalConfirmed;
                        worldNewCases += country.NewConfirmed;
                        worldRecovered += country.TotalRecovered;
                        worldNewRecovered += country.NewRecovered;
                    }
                })
                tableTitles.innerHTML = `<th>Country Name</th>
                <th>Total Deaths</th>
                <th>New Deaths</th>
                <th>Total Cases</th>
                <th>New Cases</th>
                <th>Total Recovered</th>
                <th>New Recovered</th>
                <th>TotalDeaths /1M</th>`
                let output = `<tr>
                <td>World</td>
                <td>${worldTotDeaths}</td>
                <td> + ${worldNewDeaths}</td>
                <td>${worldTotCases}</td>
                <td> + ${worldNewCases}</td>
                <td>${worldRecovered}</td>
                <td> + ${worldNewRecovered}</td>
                <td> ${(worldTotDeaths / 7800000000 * 1000000).toFixed(2)} </td>
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
                spinner.classList.toggle("hide__spinner");
            })
            .catch(err => console.error(err));


    }).catch(error => {
        console.log(error);
    });

submitBtn.addEventListener('click', (e) => {
    spinner.classList.toggle("hide__spinner");
    e.preventDefault();
    const curCountry = selectCountry.value;

    if (selectElem.value === '' || selectCountry.value === '') {
        if (!spinner.classList.contains("hide__spinner")) {
            spinner.classList.add("hide__spinner");
        }
    }

    else if (selectElem.value === 'summary') {
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
                spinner.classList.toggle("hide__spinner");
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'deathGraph') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [resp.data[0].Date];
                    let casesTable = [];
                    let casesSum = resp.data[0].Cases;
                    resp.data.forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                            } else {
                                dateTable.push(day.Date);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
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
                    spinner.classList.toggle("hide__spinner");
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    graphDiv.innerHTML = '';
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
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
                    spinner.classList.toggle("hide__spinner");
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
                    let dateTable = [resp.data[0].Date];
                    let casesTable = [];
                    let casesSum = resp.data[0].Cases;
                    resp.data.forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                            } else {
                                dateTable.push(day.Date);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
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
                        title: `Total number of Covid-19 cases in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    graphDiv.innerHTML = '';
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
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
                        title: `Total number of Covid-19 cases in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
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
                    let dateTable = [resp.data[0].Date];
                    let casesTable = [];
                    let casesSum = resp.data[0].Cases;
                    let casesTableDif = [];
                    resp.data.forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                            } else {
                                dateTable.push(day.Date);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
                    });
                    casesTable.forEach((day, index, array) => {
                        if (index > 0) {
                            casesTableDif.push(array[`${index}`] - array[`${index - 1}`]);
                        } else {
                            casesTableDif.push(day);
                        }
                    });

                    dataTable.innerHTML = '';

                    var trace1 = {
                        x: dateTable,
                        y: casesTableDif,
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
                        title: `Number of new Covid-19 deaths per day ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    graphDiv.innerHTML = '';
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
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
                        title: `Number of new Covid-19 deaths per day ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
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
                    let dateTable = [resp.data[0].Date];
                    let casesTable = [];
                    let casesSum = resp.data[0].Cases;
                    let casesTableDif = [];
                    resp.data.forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                            } else {
                                dateTable.push(day.Date);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
                    });
                    casesTable.forEach((day, index, array) => {
                        if (index > 0) {
                            casesTableDif.push(array[`${index}`] - array[`${index - 1}`]);
                        } else {
                            casesTableDif.push(day);
                        }
                    });
                    dataTable.innerHTML = '';

                    var trace1 = {
                        x: dateTable,
                        y: casesTableDif,
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
                        title: `Number of new Covid-19 cases per day in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                } else if (resp.data[resp.data.length - 1].Cases === 0) {
                    graphDiv.innerHTML = '';
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
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
                        title: `Number of new Covid-19 cases per day in ${resp.data[0].Country}`
                    };

                    Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
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
                            let dateTable = [resp.data[0].Date];
                            let casesTable = [];
                            let casesSum = resp.data[0].Cases;
                            resp.data.forEach((day, index, array) => {
                                if (index > 0) {
                                    if (index === (resp.data.length - 1)) {
                                        if (day.Date === array[index - 1].Date) {
                                            casesSum += day.Cases;
                                            casesTable.push(casesSum);
                                        } else {
                                            casesTable.push(day.Cases);
                                        }
                                    } else if (day.Date === array[index - 1].Date) {
                                        casesSum += day.Cases;
                                    } else {
                                        dateTable.push(day.Date);
                                        casesTable.push(casesSum);
                                        casesSum = day.Cases;
                                    }
                                }
                            });

                            let dateTable2 = [resp2.data[0].Date];
                            let casesTable2 = [];
                            let casesSum2 = resp2.data[0].Cases;
                            resp2.data.forEach((day, index, array) => {
                                if (index > 0) {
                                    if (index === (resp2.data.length - 1)) {
                                        if (day.Date === array[index - 1].Date) {
                                            casesSum2 += day.Cases;
                                            casesTable2.push(casesSum2);
                                        } else {
                                            casesTable2.push(day.Cases);
                                        }
                                    } else if (day.Date === array[index - 1].Date) {
                                        casesSum2 += day.Cases;
                                    } else {
                                        dateTable2.push(day.Date);
                                        casesTable2.push(casesSum2);
                                        casesSum2 = day.Cases;
                                    }
                                }
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
                            spinner.classList.toggle("hide__spinner");
                        } else if (resp.data[resp.data.length - 1].Cases === 0) {
                            graphDiv.innerHTML = '';
                            dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                            spinner.classList.toggle("hide__spinner");
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
                            spinner.classList.toggle("hide__spinner");
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
                            let dateTable = [resp.data[0].Date];
                            let casesTable = [];
                            let casesSum = resp.data[0].Cases;
                            let casesTableDif = [];
                            resp.data.forEach((day, index, array) => {
                                if (index > 0) {
                                    if (index === (resp.data.length - 1)) {
                                        if (day.Date === array[index - 1].Date) {
                                            casesSum += day.Cases;
                                            casesTable.push(casesSum);
                                        } else {
                                            casesTable.push(day.Cases);
                                        }
                                    } else if (day.Date === array[index - 1].Date) {
                                        casesSum += day.Cases;
                                    } else {
                                        dateTable.push(day.Date);
                                        casesTable.push(casesSum);
                                        casesSum = day.Cases;
                                    }
                                }
                            });
                            casesTable.forEach((day, index, array) => {
                                if (index > 0) {
                                    casesTableDif.push(array[`${index}`] - array[`${index - 1}`]);
                                } else {
                                    casesTableDif.push(day);
                                }
                            });

                            let dateTable2 = [resp2.data[0].Date];
                            let casesTable2 = [];
                            let casesSum2 = resp2.data[0].Cases;
                            let casesTableDif2 = [];
                            resp2.data.forEach((day, index, array) => {
                                if (index > 0) {
                                    if (index === (resp2.data.length - 1)) {
                                        if (day.Date === array[index - 1].Date) {
                                            casesSum2 += day.Cases;
                                            casesTable2.push(casesSum2);
                                        } else {
                                            casesTable2.push(day.Cases);
                                        }
                                    } else if (day.Date === array[index - 1].Date) {
                                        casesSum2 += day.Cases;
                                    } else {
                                        dateTable2.push(day.Date);
                                        casesTable2.push(casesSum2);
                                        casesSum2 = day.Cases;
                                    }
                                }
                            });
                            casesTable2.forEach((day, index, array) => {
                                if (index > 0) {
                                    casesTableDif2.push(array[`${index}`] - array[`${index - 1}`]);
                                } else {
                                    casesTableDif2.push(day);
                                }
                            });

                            dataTable.innerHTML = '';

                            var trace1 = {
                                x: dateTable,
                                y: casesTableDif,
                                type: 'bar',
                                name: `Cases`
                            };

                            var trace2 = {
                                x: dateTable2,
                                y: casesTableDif2,
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
                                title: `Number of new Covid-19 deaths/cases per day in ${resp.data[0].Country}`
                            };

                            Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                            spinner.classList.toggle("hide__spinner");
                        } else if (resp.data[resp.data.length - 1].Cases === 0) {
                            graphDiv.innerHTML = '';
                            dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                            spinner.classList.toggle("hide__spinner");
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
                                title: `Number of new Covid-19 deaths/cases per day in ${resp.data[0].Country}`
                            };

                            Plotly.newPlot('myDiv', data, layout, { showSendToCloud: true });
                            spinner.classList.toggle("hide__spinner");
                        }
                    }).catch(error => {
                        console.log(error);
                    });
            });
    }

    if (selectElem.value === 'compareDeath') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (usedCountries.findIndex(item => item === curCountry) > -1) {
                    alert(`This country is already used in the graph! Please reload the page!`);
                    spinner.classList.toggle("hide__spinner");
                } else if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [resp.data[0].Date];
                    let casesTable = [];
                    let casesSum = resp.data[0].Cases;
                    resp.data.forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                            } else {
                                dateTable.push(day.Date);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
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
                        title: `Total number of Covid-19 deaths comparison`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                } else if (resp.data.length === 0 || resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
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
                        title: `Total number of Covid-19 deaths comparison`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'compareCases') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (usedCountries.findIndex(item => item === curCountry) > -1) {
                    alert(`This country is already used in the graph! Please reload the page!`);
                    spinner.classList.toggle("hide__spinner");
                } else if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [resp.data[0].Date];
                    let casesTable = [];
                    let casesSum = resp.data[0].Cases;
                    resp.data.forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                            } else {
                                dateTable.push(day.Date);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
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
                        title: `Total number of Covid-19 cases comparison`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                } else if (resp.data.length === 0 || resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
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
                        title: `Total number of Covid-19 cases comparison`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'compareDeath0') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (usedCountries.findIndex(item => item === curCountry) > -1) {
                    alert(`This country is already used in the graph! Please reload the page!`);
                    spinner.classList.toggle("hide__spinner");
                } else if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [0];
                    let casesTable = [];
                    let casesSum = resp.data[resp.data.findIndex(item => item.Cases > 0)].Cases;
                    let startingPoint = 0;
                    resp.data.filter(item => item.Cases !== 0).forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.filter(item => item.Cases !== 0).length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                    dateTable.push(index - startingPoint);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                                startingPoint++;
                            } else {
                                dateTable.push(index - startingPoint);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Deaths'
                        },
                        title: `Total number of Covid-19 deaths comparison by Day-0`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                } else if (extraComplicatedCountries.findIndex(item => item === curCountry) > -1) {
                    dataTable.innerHTML = '<h1 class="missing__data">This data will be available soon</h1><br><h2 class="missing__data">Error printing graph</h2>';
                    spinner.classList.toggle("hide__spinner");
                } else if (resp.data.length === 0 || resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
                } else {
                    let dateTable = [];
                    let casesTable = [];
                    let startingPoint = 0;
                    resp.data.forEach((day, index) => {
                        if (day.Cases > 0) {
                            dateTable.push(index - startingPoint);
                            casesTable.push(day.Cases);
                        } else {
                            startingPoint++;
                        }
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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Deaths'
                        },
                        title: `Total number of Covid-19 deaths comparison by Day-0`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'compareCases0') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (usedCountries.findIndex(item => item === curCountry) > -1) {
                    alert(`This country is already used in the graph! Please reload the page!`);
                    spinner.classList.toggle("hide__spinner");
                } else if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [0];
                    let casesTable = [];
                    let casesSum = resp.data[resp.data.findIndex(item => item.Cases > 0)].Cases;
                    let startingPoint = 0;
                    resp.data.filter(item => item.Cases !== 0).forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.filter(item => item.Cases !== 0).length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                    dateTable.push(index - startingPoint);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                                startingPoint++;
                            } else {
                                dateTable.push(index - startingPoint);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Cases'
                        },
                        title: `Total number of Covid-19 cases comparison by Day-0`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                } else if (resp.data.length === 0 || resp.data[resp.data.length - 1].Cases === 0) {
                    dataTable.innerHTML = '<h1 class="missing__data">There is not a single case at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
                } else {
                    let dateTable = [];
                    let casesTable = [];
                    let startingPoint = 0;
                    resp.data.forEach((day, index) => {
                        if (day.Cases > 0) {
                            dateTable.push(index - startingPoint);
                            casesTable.push(day.Cases);
                        } else {
                            startingPoint++;
                        }
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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Cases'
                        },
                        title: `Total number of Covid-19 cases comparison by Day-0`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'compareDeath10') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/deaths`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (usedCountries.findIndex(item => item === curCountry) > -1) {
                    alert(`This country is already used in the graph! Please reload the page!`);
                    spinner.classList.toggle("hide__spinner");
                } else if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [0];
                    let casesTable = [];
                    let casesSum = resp.data[resp.data.findIndex(item => item.Cases > 0)].Cases;
                    let startingPoint = 0;
                    resp.data.filter(item => item.Cases > 0).forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.filter(item => item.Cases > 0).length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                    dateTable.push(index - startingPoint);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                                startingPoint++;
                            } else {
                                dateTable.push(index - startingPoint);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
                    });

                    let case10Index = casesTable.findIndex(item => item > 9);
                    casesTable = casesTable.filter((item, index) => index >= case10Index);
                    dateTable = [];
                    for (let i = 0; i < casesTable.length; i++) {
                        dateTable.push(i);
                    }

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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Deaths'
                        },
                        title: `Total number of Covid-19 deaths comparison after 10th death`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                } else if (resp.data.length === 0 || resp.data[resp.data.length - 1].Cases < 10) {
                    dataTable.innerHTML = '<h1 class="missing__data">There are just a few or no cases at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
                } else {
                    let dateTable = [];
                    let casesTable = [];
                    let startingPoint = 0;
                    resp.data.forEach((day, index) => {
                        if (day.Cases > 9) {
                            dateTable.push(index - startingPoint);
                            casesTable.push(day.Cases);
                        } else {
                            startingPoint++;
                        }
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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Deaths'
                        },
                        title: `Total number of Covid-19 deaths comparison after 10th death`
                    };

                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    if (selectElem.value === 'compareCases10') {
        axios(`https://api.covid19api.com/country/${curCountry.toLowerCase()}/status/confirmed`)
            .then(resp => {
                tableTitles.innerHTML = '';
                if (usedCountries.findIndex(item => item === curCountry) > -1) {
                    alert(`This country is already used in the graph! Please reload the page!`);
                    spinner.classList.toggle("hide__spinner");
                } else if (complicatedCountries.findIndex(item => item === curCountry) > -1) {
                    let dateTable = [0];
                    let casesTable = [];
                    let casesSum = resp.data[resp.data.findIndex(item => item.Cases > 0)].Cases;
                    let startingPoint = 0;
                    resp.data.filter(item => item.Cases > 0).forEach((day, index, array) => {
                        if (index > 0) {
                            if (index === (resp.data.filter(item => item.Cases > 0).length - 1)) {
                                if (day.Date === array[index - 1].Date) {
                                    casesSum += day.Cases;
                                    casesTable.push(casesSum);
                                } else {
                                    casesTable.push(day.Cases);
                                    dateTable.push(index - startingPoint);
                                }
                            } else if (day.Date === array[index - 1].Date) {
                                casesSum += day.Cases;
                                startingPoint++;
                            } else {
                                dateTable.push(index - startingPoint);
                                casesTable.push(casesSum);
                                casesSum = day.Cases;
                            }
                        }
                    });

                    let case10Index = casesTable.findIndex(item => item > 9);
                    casesTable = casesTable.filter((item, index) => index >= case10Index);
                    dateTable = [];
                    for (let i = 0; i < casesTable.length; i++) {
                        dateTable.push(i);
                    }

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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Cases'
                        },
                        title: `Total number of Covid-19 cases comparison after 10th case`
                    };
                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                } else if (resp.data.length === 0 || resp.data[resp.data.length - 1].Cases < 10) {
                    dataTable.innerHTML = '<h1 class="missing__data">There are just a few or no cases at the moment</h1><br><h2 class="missing__data">Luckily we cannot make a graph yet</h2>';
                    spinner.classList.toggle("hide__spinner");
                } else {
                    let dateTable = [];
                    let casesTable = [];
                    let startingPoint = 0;
                    resp.data.forEach((day, index) => {
                        if (day.Cases > 9) {
                            dateTable.push(index - startingPoint);
                            casesTable.push(day.Cases);
                        } else {
                            startingPoint++;
                        }
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
                            title: 'Day'
                        },
                        yaxis: {
                            title: 'Total Cases'
                        },
                        title: `Total number of Covid-19 cases comparison after 10th case`
                    };
                    Plotly.plot('myDiv', data, layout, { showSendToCloud: true });
                    spinner.classList.toggle("hide__spinner");
                    usedCountries.push(curCountry);
                }
            }).catch(error => {
                console.log(error);
            });
    }
});

comparisonDetails.addEventListener('click', e => {
    alert(`To perform comparisons choose one of the comparison modes on the bottom dropdown menu and choose one country from the top dropdown, then press submit. Now choose another country from the top dropdown menu while keeping the bottom dropdown as it is (with the previous choice) and press submit again. Now you can again choose more countries to include in the comparison graph the same way. If you want to perform a new comparison refresh the page. Note: If the graph doesn't seem right please refresh the page and try again. Also note that in countries like United States of America it could take a while to load the data, so please be patient.`);
});

about.addEventListener('click', e => {
    alert(`For more information, comments or questions:
    email: anastas.stelios@gmail.com`);
});