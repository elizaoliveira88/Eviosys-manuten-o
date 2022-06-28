import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Optimization_DATA} from "@shared/models/Optimization";
import * as vis from 'vis';

@Component({
  selector: 'app-group-network.dialog',
  templateUrl: './group-network.dialog.component.html',
  styleUrls: ['./group-network.dialog.component.css']
})
export class GroupNetworkDialogComponent implements OnInit {

    selectedOpt: Partial<Optimization_DATA> = {
        name: ''
    };
  constructor(public dialogRef: MatDialogRef<GroupNetworkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      if(data.opt){
          this.selectedOpt = data.opt;
      }
  }

  ngOnInit(): void {
      this.setup();
  }

  close(){
      this.dialogRef.close();
  }

  setup() {
      let arr = [];
      let edges = [];

      this.selectedOpt.optimizationApplications.forEach(app=>{
          let color = {
              border:'#000000',
              background:'#e0e0e0'
          };
          switch(app.group){
              case 1:{
                  //red
                  color = {
                      border:'#e05d5d',
                      background:'#efcaca'
                  };
              }break;
              case 2:{
                  //blue
                  color = {
                      border:'#5767ea',
                      background:'#9fa8f1'
                  };
              }break;
              case 3:{
                  //green
                  color = {
                      border:'#71ea22',
                      background:'#69c42d'
                  };
              }break;
              case 4:{
                  //orange
                  color = {
                      border:'#ff8a34',
                      background:'#e2a87d'
                  };
              }break;
              case 5:{
                  //yellow
                  color = {
                      border:'#f3e152',
                      background:'#f1e89f'
                  };
              }break;
              case 6:{
                  //grey
                  color = {
                      border:'#868686',
                      background:'#b1b1b1'
                  };
              }break;

          }
          arr.push({
              id:app.id,
              label: app.application.name,
              color:color,
              groupIndex: app.group
          });

          //edges:
          if(app.hasOwnProperty('group')){
              let currentGroup = app.group;

              this.selectedOpt.optimizationApplications.forEach(current=>{
                  if(current.group !== null && app.id!==current.id && currentGroup === current.group){
                      edges.push({
                          from: app.id,
                          to:current.id,
                          hidden:false
                      });
                  }
              })

          }
      });

      //extra manual positioning of nodes
      let radius = 200; // for vis does not matter -> just relations
      let numberItems = arr.length;
      let width = 40,
          height = 20,
          angle = 0,
          step = (2*Math.PI) / numberItems;


      for(let k=0;k<arr.length;k++){
          let item = arr[k];
          let x = Math.round(width/2 + radius * Math.cos(angle) - width/2),
              y = Math.round(height/2 + radius * Math.sin(angle) - height/2);
          item.x = x;
          item.y = y;
          angle += step;
      }

      let nodes = new vis.DataSet(arr);
      let myEdges = new vis.DataSet(edges);

      // create a network
      let container = document.getElementById('mynetwork');
      let data = {
          nodes: nodes,
          edges: myEdges
      };
      let options = {
          nodes:{
              fixed: {
                  y: true,
                  x:true
              },
              borderWidth: 1,
              borderWidthSelected: undefined,
              brokenImage:undefined,
              color: {
                  highlight: {
                      border: '#BA1126',
                      background: '#e05d5d'
                  },
                  hover: {
                      border: '#BA1126',
                      background: '#e05d5d'
                  }
              },
              font: {
                  color: 'black',
                  size: 18, // px
                  background: 'none',
                  align: 'horizontal'
              },
              scaling: {
                  min: 10,
                  max: 30,
                  label: {
                      enabled: false,
                      min: 14,
                      max: 30,
                      maxVisible: 30,
                      drawThreshold: 5
                  }
              },
              shadow:{
                  enabled: true,
                  size:10,
                  x:5,
                  y:5
              },
              shape: 'box',
              size: 35
          },
          physics:{
              enabled:false
          },
          interaction:{
              hover:true,
              zoomView: false},
          layout:{
              randomSeed: undefined,
              improvedLayout:true,
              hierarchical: {
                  enabled:false,
                  levelSeparation: 150,
                  nodeSpacing: 100,
                  treeSpacing: 200,
                  blockShifting: true,
                  edgeMinimization: true,
                  parentCentralization: true,
                  direction: 'UD',        // UD, DU, LR, RL
                  sortMethod: 'hubsize'   // hubsize, directed
              }
          }
      };

      // initialize your network!
      let network = new vis.Network(container, data, options);

      network.on( 'selectNode', function(properties) {
          let ids = properties.nodes;
          let clickedNodes = nodes.get(ids);

          let thisEdges = properties.edges;
          let ar = [];
          for (let key in myEdges._data) {
              let bool=false;
              if (!myEdges._data.hasOwnProperty(key)) continue;
              for(let i=0;i<thisEdges.length;i++) {
                  let eId = thisEdges[i];
                  if(eId === key) {
                      bool = true;
                  }
              }
              if(bool) {
                  ar.push({
                      id:key,
                      hidden:false
                  });
              }else{
                  ar.push({
                      id:key,
                      hidden:true
                  });
              }

          }
          myEdges.update(ar);
          network.fit();
      });

      network.on( 'deselectNode', function(properties) {
          let ar = [];
          for (let key in myEdges._data) {
              ar.push({
                  id:key,
                  hidden:false
              });
          }
          myEdges.update(ar);
          network.fit();
      });
  }
}
