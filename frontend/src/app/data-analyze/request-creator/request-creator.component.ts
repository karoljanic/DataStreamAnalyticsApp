import { AfterViewInit, Component } from '@angular/core';
import { Stage } from 'konva/lib/Stage';
import { Group } from 'konva/lib/Group';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';
import { KonvaEventObject } from 'konva/lib/Node';

enum RequestNodeType {
  OPERAND,
  OPERATOR,
  ARGUMENT,
  LEFT_ARGUMENT,
  RIGHT_ARGUMENT
}

type RequestNodeInfo = {
  type: RequestNodeType,
  parentId: number | null,
  leftChildId: number | null,
  rightChildId: number | null,
  containerId: number | null,
  leftEmptyArgumentId: number | null,
  rightEmptyArgumentId: number | null,
  labelId: number | null,
};

type RequestNode = Rect | Group;

@Component({
  selector: 'app-request-creator',
  templateUrl: './request-creator.component.html',
  styleUrls: ['./request-creator.component.scss'],
})
export class RequestCreatorComponent implements AfterViewInit {
  private operands: string[] = [];
  private operators: string[] = [];
  private primaryColor: string = '';
  private secondaryColor: string = '';
  private tertiaryColor: string = '';
  private quaternaryColor: string = '';
  private textFont: string = '';
  private textSize: number = 0;
  private textColor: string = '';
  private internalPadding: number = 0;
  private stage: Stage | null = null;
  private backLayer: Layer | null = null;
  private frontLayer: Layer | null = null;
  private currentDragStart: any = undefined;
  private currentDragTarget: any = undefined;

  ngAfterViewInit(): void {
    this.initializeRequestCreator(1000, 500, 'konva-container', ['teal', 'aqua', 'white', '#dcdcdc'], 'verdana', 20, 'black', 10, ['a', 'def', '123', 'xyzyx'], ['$', '&&', 'modulo']);

    for (const operand of this.operands) {
      this.createOperand(operand, this.secondaryColor);
    }

    for (const operator of this.operators) {
      this.createOperator(operator);
    }
  }

  initializeRequestCreator(areaWidth: number, areaHeight: number, containerId: string,
    colors: string[], textFont: string, textSize: number, textColor: string,
    internalPadding: number, operands: string[], operators: string[]): void {

    this.primaryColor = colors[0];
    this.secondaryColor = colors[1];
    this.tertiaryColor = colors[2];
    this.quaternaryColor = colors[3];
    this.textFont = textFont;
    this.textSize = textSize;
    this.textColor = textColor;
    this.internalPadding = internalPadding;
    this.operands = operands;
    this.operators = operators;

    this.stage = new Stage({
      container: containerId,
      width: areaWidth,
      height: areaHeight
    });

    this.backLayer = new Layer();
    this.frontLayer = new Layer();
    this.stage.add(this.backLayer);
    this.stage.add(this.frontLayer);

    this.stage.draw();
  }

  private createOperand(operand: string, color: string): RequestNode {
    const operandLabel = this.createText(operand, false);

    const operandLabelWidth = operandLabel.width();
    const operandLabelHeight = operandLabel.height();

    const operandOvalWidth = operandLabelWidth + 2 * this.internalPadding;
    const operandOvalHeight = operandLabelHeight + this.internalPadding;

    const operandOval = this.createOval(operandOvalWidth, operandOvalHeight, color, false);

    operandLabel.setAttr('offsetX', -this.internalPadding);
    operandLabel.setAttr('offsetY', -this.internalPadding / 2);

    const operandGroup = this.createGroup(true);

    operandGroup.add(operandOval);
    operandGroup.add(operandLabel);

    this.backLayer!.add(operandGroup);

    operandGroup.on('dragstart', this.handleDragstart.bind(this));
    operandGroup.on('dragend', this.handleDragend.bind(this));
    operandGroup.on('dragmove', this.handleDragmove.bind(this));

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.OPERAND,
      parentId: null,
      leftChildId: null,
      rightChildId: null,
      containerId: operandOval._id,
      leftEmptyArgumentId: null,
      rightEmptyArgumentId: null,
      labelId: operandLabel._id
    };
    operandGroup.setAttr('metadata', nodeInfo);

    return operandGroup;
  }

  private createArgument(color: string): RequestNode {
    const argumentLabel = this.createText('   ', false);

    const operandLabelWidth = argumentLabel.width();
    const operandLabelHeight = argumentLabel.height();

    const operandOvalWidth = operandLabelWidth + 2 * this.internalPadding;
    const operandOvalHeight = operandLabelHeight + this.internalPadding;

    const operandOval = this.createOval(operandOvalWidth, operandOvalHeight, color, false);

    this.backLayer!.add(operandOval);

    operandOval.on('dragenter', this.handleDragenter.bind(this));
    operandOval.on('dragleave', this.handleDragleave.bind(this));
    operandOval.on('drop', this.handleDrop.bind(this));

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.ARGUMENT,
      parentId: null,
      leftChildId: null,
      rightChildId: null,
      containerId: operandOval._id,
      leftEmptyArgumentId: null,
      rightEmptyArgumentId: null,
      labelId: argumentLabel._id
    };
    operandOval.setAttr('metadata', nodeInfo);

    return operandOval;
  }

  private createOperator(operator: string): RequestNode {
    const leftArgument = this.createArgument(this.tertiaryColor);
    const rightArgument = this.createArgument(this.tertiaryColor);

    leftArgument.setAttr('x', 0);
    leftArgument.setAttr('y', 0);

    rightArgument.setAttr('x', 0);
    rightArgument.setAttr('y', 0);

    const operatorLabel = this.createText(operator, false);
    const operatorOval = this.createOval(0, 0, this.primaryColor, false);
    const operatorGroup = this.createGroup(true);

    operatorGroup.add(operatorOval);
    operatorGroup.add(leftArgument);
    operatorGroup.add(rightArgument);
    operatorGroup.add(operatorLabel);

    (leftArgument.getAttr('metadata') as RequestNodeInfo).type = RequestNodeType.LEFT_ARGUMENT;
    (rightArgument.getAttr('metadata') as RequestNodeInfo).type = RequestNodeType.RIGHT_ARGUMENT;

    (leftArgument.getAttr('metadata') as RequestNodeInfo).parentId = operatorGroup._id;
    (rightArgument.getAttr('metadata') as RequestNodeInfo).parentId = operatorGroup._id;

    this.backLayer!.add(operatorGroup);

    operatorGroup.on('dragstart', this.handleDragstart.bind(this));
    operatorGroup.on('dragend', this.handleDragend.bind(this));
    operatorGroup.on('dragmove', this.handleDragmove.bind(this));

    const nodeInfo: RequestNodeInfo = {
      type: RequestNodeType.OPERATOR,
      parentId: null,
      leftChildId: null,
      rightChildId: null,
      containerId: operatorOval._id,
      leftEmptyArgumentId: leftArgument._id,
      rightEmptyArgumentId: rightArgument._id,
      labelId: operatorLabel._id
    };
    operatorGroup.setAttr('metadata', nodeInfo);

    this.redrawOperatorNode(operatorGroup);

    return operatorGroup;
  }

  private redrawOperatorNode(node: Group): void {
    const nodeInfo = node.getAttr('metadata') as RequestNodeInfo;

    const leftArgument: RequestNode = nodeInfo.leftChildId !== null ? this.findObjectById(node.children, nodeInfo.leftChildId)! : this.findObjectById(node.children, nodeInfo.leftEmptyArgumentId!)!;
    const rightArgument: RequestNode = nodeInfo.rightChildId !== null ? this.findObjectById(node.children, nodeInfo.rightChildId)! : this.findObjectById(node.children, nodeInfo.rightEmptyArgumentId!)!;
    const operatorLabel: Text = this.findObjectById(node.children, nodeInfo.labelId!);
    const operatorContainer: Rect = this.findObjectById(node.children, nodeInfo.containerId!);

    const leftArgumentWidth = leftArgument.getClientRect().width;
    const leftArgumentHeight = leftArgument.getClientRect().height;

    const rightArgumentWidth = rightArgument.getClientRect().width;
    const rightArgumentHeight = rightArgument.getClientRect().height;

    const operatorLabelWidth = operatorLabel.width();
    const operatorLabelHeight = operatorLabel.height();

    const operatorOvalWidth = operatorLabelWidth + leftArgumentWidth + rightArgumentWidth + 4 * this.internalPadding;
    const operatorOvalHeight = Math.max(operatorLabelHeight, leftArgumentHeight, rightArgumentHeight) + this.internalPadding;

    operatorContainer.setAttr('width', operatorOvalWidth);
    operatorContainer.setAttr('height', operatorOvalHeight);
    operatorContainer.setAttr('cornerRadius', operatorOvalHeight / 2);

    operatorLabel.setAttr('offsetX', -(2 * this.internalPadding + leftArgumentWidth));
    operatorLabel.setAttr('offsetY', -(operatorOvalHeight - operatorLabelHeight) / 2);

    leftArgument.setAttr('x', 0);
    leftArgument.setAttr('y', 0);
    leftArgument.setAttr('offsetX', -this.internalPadding);
    leftArgument.setAttr('offsetY', -(operatorOvalHeight - leftArgumentHeight) / 2);

    rightArgument.setAttr('x', 0);
    rightArgument.setAttr('y', 0);
    rightArgument.setAttr('offsetX', -(operatorOvalWidth - this.internalPadding - rightArgumentWidth));
    rightArgument.setAttr('offsetY', -(operatorOvalHeight - leftArgumentHeight) / 2);
  }

  private createOval(width: number, height: number, fillColor: string, draggable: boolean): Rect {
    return new Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      cornerRadius: height / 2,
      fill: fillColor,
      strokeWidth: 0.1,
      stroke: "black",
      draggable: draggable
    });
  }

  private createText(text: string, draggable: boolean): Text {
    return new Text({
      x: 0,
      y: 0,
      text: text,
      fontSize: this.textSize,
      fontFamily: this.textFont,
      fill: this.textColor,
      draggable: draggable
    });
  }

  private createGroup(draggable: boolean): Group {
    return new Group({
      x: this.stage!.width() / 2,
      y: this.stage!.height() / 2,
      draggable: draggable,
    });
  }

  private handleDragstart(e: KonvaEventObject<DragEvent>): void {
    e.target.moveTo(this.frontLayer);
    this.currentDragStart = e.target;
  }

  private handleDragend(e: KonvaEventObject<DragEvent>): void {
    var pointerPosition = this.stage!.getPointerPosition();
    if (pointerPosition) {
      var shape = this.backLayer!.getIntersection(pointerPosition);
      if (shape) {
        this.currentDragTarget.fire('drop', { evt: e.evt }, true);
      }
      this.currentDragTarget = undefined;

      e.target.moveTo(this.backLayer);
    }
  }

  private handleDragenter(e: KonvaEventObject<DragEvent>): void {
    (e.target as any).fill(this.quaternaryColor);
  }

  private handleDragleave(e: KonvaEventObject<DragEvent>): void {
    (e.target as any).fill(this.tertiaryColor);
  }

  private handleDrop(e: KonvaEventObject<DragEvent>): void {
    (e.target as any).fill(this.tertiaryColor);
    setTimeout(() => { this.attachChild(e.target as RequestNode, this.currentDragStart); }, 50); // this delay necessary, because drageventhandlers are async
  }

  private handleDragmove(evt: KonvaEventObject<any>): void {
    var pointerPosition = this.stage!.getPointerPosition();
    if (pointerPosition) {
      var shape = this.backLayer!.getIntersection(pointerPosition);
      if (this.currentDragTarget && shape) {
        if (this.currentDragTarget !== shape) {
          this.currentDragTarget.fire('dragleave', { evt: evt.evt }, true);
          shape.fire('dragenter', { evt: evt.evt }, true);
          this.currentDragTarget = shape;
        }
        else {
          this.currentDragTarget.fire('dragover', { evt: evt.evt }, true);
        }
      }
      else if (!this.currentDragTarget && shape) {
        this.currentDragTarget = shape;
        shape.fire('dragenter', { evt: evt.evt }, true);
      }
      else if (this.currentDragTarget && !shape) {
        this.currentDragTarget.fire('dragleave', { evt: evt.evt }, true);
        this.currentDragTarget = undefined;
      }
    }
  }

  private attachChild(emptyArgument: RequestNode, childToAttach: Group): void {
    console.log("ATTACH CHILD");

    const emptyArgumentInfo = emptyArgument.getAttr('metadata') as RequestNodeInfo;
    const emptyArgumentParent = this.getStageObjectById(emptyArgumentInfo.parentId!) as Group;    // TODO this object can be not attatched to scene
    const emptyArgumentParentInfo = emptyArgumentParent.getAttr('metadata') as RequestNodeInfo;

    console.log(this.stage?.getChildren()[0].getChildren())
    console.log(this.stage?.getChildren()[1].getChildren())

    // childToAttach.remove();
    // emptyArgumentParent.add(childToAttach);

    childToAttach.moveTo(emptyArgumentParent)

    console.log(this.stage?.getChildren()[0].getChildren())
    console.log(this.stage?.getChildren()[1].getChildren())

    if (emptyArgumentInfo.type == RequestNodeType.LEFT_ARGUMENT) {
      this.findObjectById(emptyArgumentParent.children, emptyArgumentParentInfo.leftEmptyArgumentId!).visible(false);
      emptyArgumentParentInfo.leftChildId = childToAttach._id;
    }
    else {
      this.findObjectById(emptyArgumentParent.children, emptyArgumentParentInfo.rightEmptyArgumentId!).visible(false);
      emptyArgumentParentInfo.rightChildId = childToAttach._id;
    }

    this.redrawOperatorNode(emptyArgumentParent);
  }

  private detachChild(childToAttach: Group): void {
    console.log("DETACH CHILD");
  }

  private findObjectById(elements: any[], id: number): any {
    for (const element of elements) {
      if (element._id == id) {
        return element;
      }
    }

    return null;
  }

  private getStageObjectById(id: number): any {
    const layers: Layer[] = this.stage!.children;
    for (const layer of layers) {
      const objects: any[] = layer.children;
      for (const object of objects) {
        if (object._id === id) {
          return object;
        }
      }
    }

    return null;
  }
}
