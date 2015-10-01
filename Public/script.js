var config;
$(function(){
    setInterval(function(){
        refreshPage()
    }, 300000);

    getConfig(function(configResult){
        config = configResult;
        addConfig();

        getTrelloData(function(data){
            var chartData = {
                workDays: []
                ,planned: {
                    name: 'Previsto',
                    data: []
                }
                ,realized: {
                    name: 'Realizado',
                    data: []
                }
                ,yAxisName: config.sysConfig.nome_eixo_y
            };

            var buffer;
            var somaPontos = 0.0;

            var burndownCards = getBurndownCards(data.cards); 

            burndownCards.forEach(function(card){
                buffer = card.name.getPoints();
                if (buffer !== NaN){
                    somaPontos += buffer;
                }
            });

            var days = getDays();

            var workDays = days.filter(function(day){
                return day.work;
            });

            workDays.forEach(function(workDay){
                chartData.workDays.push(workDay.day.toSimpleString());
            });

            chartData.planned.data = calculatePlannedPoints(somaPontos, workDays.length);

            var doneCards = getCardsFromList(burndownCards);

            chartData.realized.data = calculateRealizedPoints(somaPontos, days, doneCards);


            addChart(chartData);  // Chama gráfico
        }); 
    });

	
});

var refreshPage = function(){
    window.location.reload(true);
};

var getCardsFromList = function(burndownCards){
    return burndownCards.filter(function(card){
        return card.due || card.checklists.some(function(checklist){
            return checklist.checkItems.some(function(checkItem){
                return checkItem.state === 'complete';
            });
        });
    });
};

var pushErrorMessage = function(message){
    $('#errorMessages').append('<p>' + message + '</p>');
    $('#errorContainer').slideDown('slow');

};

var checkCardsBeforeRange = function(cards, date){ // Joga todos os cards em Done com data anterior ao início útil da sprint para o primeiro dia útil
    var returnCards = cards;
    var outOfRange = returnCards.some(function(card){
        return card.due < date;
    });

    if (outOfRange){
        returnCards.filter(function(card){
            return card.due < date;
        }).forEach(function(card){ 
            card.due = date;
        });
        pushErrorMessage('Existem apontamentos de Due Date com data anterior ao primeiro dia útil da sprint. Esses pontos foram atribuídos ao primeiro dia da sprint.');
    }

    return returnCards;
};

var checkCardsAfterRange = function(cards, date){ // Joga todos os cards em Done com data posterior ao final útil da sprint para o último dia útil
    var returnCards = cards;
    var outOfRange = returnCards.some(function(card){
        return card.due > date;
    });

    if (outOfRange){
        returnCards.filter(function(card){
            return card.due > date;
        }).forEach(function(card){ 
            card.due = date;
        });
        pushErrorMessage('Existem apontamentos de Due Date com data posterior ao último dia útil da sprint. Esses pontos foram atribuídos ao último dia da sprint.');
    }

    return returnCards;
};

var checkNotWorkingDays = function(cards, days){ // Joga os cards de dias sem jornada para o dia de trabalho anterior (caso haja) ou posterior.
    var returnCards = cards;

    var workDays = days.filter(function(day){ 
            return day.work;
        }).map(function(day){
            return day.day;
        });

    var dayIterator;
    returnCards.forEach(function(card){
        days.forEach(function(day){
            if (!day.work && card.due.date.equals(day.day)){ // Se o card for de dia sem trabalho
                dayIterator = $.inArray(day, days);
                while (!days[dayIterator].work){
                    dayIterator--;
                }
                card.due = days[dayIterator].day;
            }
        });
    });



    return returnCards;
};

var calculateRealizedPoints = function(points, days, doneCards){
    var realizedPoints = [];
    var remainingPoints = points;
    var dayPoints;
    var workDays = days.filter(function(day){ 
            return day.work;
        }).map(function(day){
            return day.day;
        });

    doneCards.forEach(function(card){ // Normaliza cards para meia noite (ignorando a hora nas comparações)
        var hasDueDate = card.due ? true : false;
        var due = card.due;
        card.due = {
            date: null,
            hasDue: hasDueDate
        };

        card.due.date = card.due.hasDue ? new Date(due).toMidnight() : new Date().toMidnight();
    });

    doneCards = checkCardsBeforeRange(doneCards, workDays[0]);
    doneCards = checkCardsAfterRange(doneCards, workDays[workDays.length - 1]);
    doneCards = checkNotWorkingDays(doneCards, days);


    workDays.forEach(function(day){
        if (day <= new Date().toMidnight()){
            doneCards.filter(function(card){
                return card.due.date.equals(day);
            }).forEach(function(card){
                remainingPoints -= card.due.hasDue ? card.name.getPoints() : getDonePointRate(card);
            });            
            realizedPoints.push(
                parseFloat(remainingPoints.toFixed(2))
            );            
        } else {
            return;
        }
    });

    return realizedPoints;
};

var getDonePointRate = function(card){
    var totalPoints = card.name.getPoints();
    var allItensAmount = 0;
    var doneItensAmount = 0;

    card.checklists.forEach(function(checklist){
        allItensAmount += checklist.checkItems.length;
        doneItensAmount += checklist.checkItems.filter(function(checkItem){
            return checkItem.state === 'complete';
        }).length;
    });

    return totalPoints * (doneItensAmount / allItensAmount);
};


var getBurndownCards = function(allCards){
    retorno = [];

    allCards.forEach(function(card){
        if (card.labels.containsName(config.sysConfig.nome_label_burndown)){
            retorno.push(card);
        }
    });

    return retorno;
};


var calculatePlannedPoints = function(points, days){
    var retorno = [];
    var pointsDecrementer = points;
    var decrementFactor = points / (days - 1);
    for (var dayCount = days ; dayCount > 0 ; dayCount--){
        retorno.push(parseFloat(pointsDecrementer.toFixed(2)));
        pointsDecrementer -= decrementFactor;
    }    

    return retorno;
}

String.prototype.getPoints = function(){
    return parseFloat(this.split('(')[1].split(')')[0]);
};

Array.prototype.containsName = function(name){
    var retorno = false;
    this.forEach(function(elem){
        if (elem.name === name){
            retorno = true;
            return retorno;
        }
    });
    return retorno;
};

Date.prototype.toMidnight = function(){
    return new Date(this.setHours(0, 0, 0));
};

Date.prototype.equals = function(date){
    if (this.getDate() === date.getDate() && this.getMonth() === date.getMonth() && this.getFullYear() == date.getFullYear()){
        return true;
    }
    return false;
};

Date.prototype.toSimpleString = function(){
    var returnString = '';
    if (this.getDate() < 10)
        returnString += '0';
    returnString += this.getDate() + '/';
    var monthName = '';
    switch(this.getMonth()){
        case 0:
            monthName = 'Jan';
            break;
        case 1:
            monthName = 'Fev';
            break;
        case 2:
            monthName = 'Mar';
            break;
        case 3:
            monthName = 'Abr';
            break;
        case 4:
            monthName = 'Mai';
            break;
        case 5:
            monthName = 'Jun';
            break;
        case 6:
            monthName = 'Jul';
            break;
        case 7:
            monthName = 'Ago';
            break;
        case 8:
            monthName = 'Set';
            break;
        case 9:
            monthName = 'Out';
            break;
        case 10:
            monthName = 'Nov';
            break;
        case 11:
            monthName = 'Dez';
            break;
    }
    returnString += monthName;
    return returnString;
}

Date.prototype.tomorrow = function(){  // Somar um dia à data do parâmetro
    var nextDay = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
};

Date.prototype.yesterday = function(){  // Subtrair um dia à data do parâmetro
    var yesterday = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
};

var stringToDate = function(date){ // Parâmetro no formato DD/MM/YYYY
    var buffer = date.split('/');
    return new Date(buffer[2], buffer[1] - 1, buffer[0]);
};



var isWorkDay = function(date, holidays){  // Verifica se o parâmetro date é um dia com jornada de trabalho
    if (date.getDay() === 0 || date.getDay() === 6){ // Checa Domingo ou Sábado
        return false;
    }
    return !holidays.some(function(holiday){
        return date.equals(holiday);
    });
};

var getHolidays = function(){
    holidays = [];
    config.sprintConfig.dias_sem_jornada.forEach(function(diaSemJornada){
        holidays.push(stringToDate(diaSemJornada));
    });
    return holidays;
}

var getDays = function(){
    var days = [];
    var dayIterator = stringToDate(config.sprintConfig.data_inicial);
    var finalDate = stringToDate(config.sprintConfig.data_final);
    var holidays = getHolidays();



    while (dayIterator - finalDate <= 0){
        days.push({
            day: dayIterator,
            work: isWorkDay(dayIterator, holidays)
        });

        dayIterator = dayIterator.tomorrow();
    }
    return days;
}


var getTrelloData = function(callback){    
    $.ajax({
        method: 'GET'
        ,url: getUrlTrelloApi()
    }).done(function(data){
        callback(data);
    });
};

var getUrlTrelloApi = function(){
    var board_id = config.sprintConfig.url_trello.split('/')[4];
    var urlString = "https://api.trello.com/1/board/"+ board_id +"?key="+ config.sysConfig.key_trello +"&cards=open&lists=open&card_checklists=all&token=" + config.sysConfig.token_trello
    console.log(urlString);
    return urlString;
};

var addConfig = function(){
    addAnimations();
    changeCssProperty('body', 'background-color', '#' + config.sysConfig.cor_de_fundo_da_tela);
	changeCssProperty('#crew-container', 'background-color', '#' + config.sysConfig.cor_de_fundo_do_titulo);
    changeCssProperty('#crew-name', 'color', '#' + config.sysConfig.cor_fonte);
    changeCssProperty('#content', 'width', config.sprintConfig.width);
    console.log(config.sprintConfig.width);
    $('#crew-name').append(config.sysConfig.nome_da_equipe);
    $('#link-trello').attr('href', config.sprintConfig.url_trello);
};

var changeCssProperty = function(selector, propertyName, propertyValue){
	$(selector).css(propertyName, propertyValue);
};

var addChart = function(data){
	$('#burndown').highcharts({
        chart: {
            type: 'line',
            backgroundColor: '#' + config.sysConfig.cor_de_fundo_da_tela,
            height: 520
        },
        title: {
            text: 'Burndown'
        },
        subtitle: {
            text: config.sprintConfig.legenda_burndown ? config.sprintConfig.legenda_burndown : ''
        },
        xAxis: {
            categories: data.workDays
        },
        yAxis: {
        	min: 0,
        	minRange: 0.1,
            title: {
                text: data.yAxisName
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
        },
        series: [data.realized, data.planned]
    });
};