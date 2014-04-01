window.onload = function(){
  init();
};

//https://docs.google.com/a/ciklum.com/spreadsheet/ccc?key=0ApjKtj6uXW8VdEF2Wk9abEV0M0VZX19XWnVRemZ5UXc&usp=drive_web#gid=0
var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0ApjKtj6uXW8VdEF2Wk9abEV0M0VZX19XWnVRemZ5UXc&output=html';

function getTable(rowList){
  var trTagList = rowList.map(function(tdList){
    var tdTagList = tdList.map(function(tdText){
      return '<td>' + tdText + '</td>';
    });

    return '<tr>' + tdTagList.join('') + '</tr>';
  });

  return '<table>' + trTagList.join('') + '</table>';
}

function init() {
  Tabletop.init({
    key: public_spreadsheet_url,
    callback: showInfo,
    simpleSheet: true,
    parseNumbers: true
  });
}

function showInfo(data) {
  var teamA = 'teama';
  var teamB = 'teamb';
  var scoreA = 'scorea';
  var scoreB = 'scoreb';
  var date = 'date';

  var loadingDiv = document.getElementById('loading');
  loadingDiv.remove();

  var teamList = [data[0][teamA], data[0][teamB]];

  var resultArray = data
    .filter(function(item){
      return teamList.indexOf(item[teamA]) != -1 && teamList.indexOf(item[teamB]) != -1;
    })
    .map(function(item, index){
      return {
        scoreA : item[scoreA],
        scoreB : item[scoreB]
      };
    });

  var gameNameArray = data.map(function(item, index){
    return item[date];
  });

  renderStatistics(resultArray, gameNameArray, data[0][teamA], data[0][teamB]);

  var resultTable = getTable(data.map(function(item){
    return [item[date], item[teamA], item[scoreA], item[scoreB], item[teamB]];
  }))

  // data comes through as a simple array since simpleSheet is turned on
  document.querySelector("#data").innerHTML = resultTable;//JSON.stringify(data);

/*        var teamAExpectedResult = teamAScoreData.reduce(function(agregate, currentValue){
    return agregate + currentValue.y;
  }, 0) / teamAScoreData.length;
  var teamBExpectedResult = teamBScoreData.reduce(function(agregate, currentValue){
    return agregate + currentValue.y;
  }, 0) / teamBScoreData.length;

  alert(teamAExpectedResult + ' : ' + teamBExpectedResult);*/
}

function renderStatistics(resultArray, gameNameArray, teamAName, teamBName){
  // Render score graph.
  {

    nv.addGraph(function() {
      var chart = nv.models.lineChart()
        .margin({left: 50})
        .useInteractiveGuideline(true)
        .transitionDuration(350)
        .showLegend(true)
        .showYAxis(true)
        .showXAxis(true)
      ;

      chart.xAxis
          .axisLabel('Date')
          .tickFormat(function (x){
              return gameNameArray[x];
          });

      chart.yAxis
          .axisLabel('Games won')
          .tickFormat(d3.format('d'));

      var teamAScoreData = resultArray.map(function(item, index){
        return {
          x : index,
          y : item.scoreA
        };
      });

      var teamBScoreData = resultArray.map(function(item, index){
        return {
          x : index,
          y : item.scoreB
        };
      });

      var data =[{
        values: teamAScoreData,
        key: teamAName,
        color: '#ff7f0e'
      }, {
        values: teamBScoreData,
        key: teamBName,
        color: '#2ca02c'
      }];

      d3.select('.scoreChart svg')
        .datum(data)
        .call(chart);

      nv.utils.windowResize(function() { chart.update() });

      return chart;
    });
  }

  // Render statistics
  {
    var teamAWinCount = resultArray.filter(function(item){
      return item.scoreA > item.scoreB;
    }).length;
    var teamBWinCount = resultArray.filter(function(item){
      return item.scoreB > item.scoreA;
    }).length;
    var teamAGamesWonCount = resultArray.reduce(function(agg, item){
      return agg + item.scoreA;
    }, 0);
    var teamBGamesWonCount = resultArray.reduce(function(agg, item){
      return agg + item.scoreB;
    }, 0);

    var teamALongestWinSequence = 0;
    var teamBLongestWinSequence = 0;
    var currentAWinSequence = 0;
    var currentBWinSequence = 0;

    for (var i = 0; i < resultArray.length; i++){
      var isAVictor = resultArray[i].scoreA > resultArray[i].scoreB; 
      var isBVictor = resultArray[i].scoreA < resultArray[i].scoreB;

      if (isAVictor){
        if (currentBWinSequence > 0){
          currentBWinSequence = 0;
        }
        currentAWinSequence++;

        if (currentAWinSequence > teamALongestWinSequence){
          teamALongestWinSequence = currentAWinSequence;
        }
      }

      if (isBVictor){
        if (currentAWinSequence > 0){
          currentAWinSequence = 0;
        }
        currentBWinSequence++;

        if (currentBWinSequence > teamBLongestWinSequence){
          teamBLongestWinSequence = currentBWinSequence;
        }
      }
    }

    var resultTable = getTable([[teamAName, 'team', teamBName], [teamAWinCount, 'wins', teamBWinCount], [teamALongestWinSequence, 'longest winning streak', teamBLongestWinSequence], [currentAWinSequence, 'current winning streak', currentBWinSequence], [teamAGamesWonCount, 'total games won', teamBGamesWonCount]]);
    document.querySelector(".statistics").innerHTML = resultTable;//JSON.stringify(data);
  }
}