/**
 * 
 * See: 
 * https://react.dev/learn/choosing-the-state-structure
 * https://mauriciopoppe.github.io/function-plot/
 * https://stackoverflow.com/questions/65828870/plotting-a-function-in-react-with-dynamic-input
 * https://snipcart.com/blog/reactjs-wordpress-rest-api-example
 */
import React, { useEffect, useState } from 'react';
import functionPlot from 'function-plot';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const std_tp = 36.5;
const std_ph = 7.4;
const std_paco2 = 40;
const std_pao2 = 92;

export default function HemoglobinOxygenSaturationCurve() {
	let hbCurveShift = 1;
	const [tp, setTp] = useState(std_tp);
	const [ph, setPh] = useState(std_ph);
	const [paco2, setPaco2] = useState(std_paco2);
	
	function handleTpChange(e) {
		setTp(e.target.value);
	}
	function handlePhChange(e) {
		setPh(e.target.value);
	}
	function handlePaco2Change(e) {
		setPaco2(e.target.value);
	}
	function handleSubmit(e) {
		plotMe();
	}
	function handleReset(e) {
		setTp(std_tp);
		setPh(std_ph);
		setPaco2(std_paco2);
	}

	function calcHbCurveShift(tp, ph, paco2) {
		return 10**(0.024 * (std_tp - tp) + 0.40*(ph - std_ph) + 0.06*(Math.log10(std_paco2) - Math.log10(paco2))); 
	}
	
	function hbCurve(pao2, hbCurveShift) {
		let thispo2 = pao2 * hbCurveShift; 
	    let sat = 1 / (1 + 23400 * (Math.pow((Math.pow(thispo2, 3) + 150 * thispo2), -1)));
	    return sat * 100;
	}
	
	function plotMe() {
		hbCurveShift = calcHbCurveShift(tp, ph, paco2);
		functionPlot({
			target: '#hbCurve',
			width: 700,
			height: 500,
			tip: {
				xLine: true,    // dashed line parallel to y = 0
				yLine: true,    // dashed line parallel to x = 0
			},
			yAxis: {
				label: 'SpO2 %',
				domain: [0, 100]
			},
			xAxis: {
				label: 'PaO2 mmHg',
				domain: [0, 110]
			},
			data: [
				{ graphType: 'polyline', fn: function(scope) { return hbCurve(scope.x, 1) }, color: 'red' },
				{ graphType: 'polyline', fn: function(scope) { return hbCurve(scope.x, hbCurveShift) }, color: 'blue' }
			],
			annotations: [{
				x: std_pao2,
				text: 'Standard PaO2'
			  },
			  {
				y: 50,
				text: 'p50'
			  }
			],			
			disableZoom: true,
			grid: true
		});
	}
	
	useEffect(() => {
		plotMe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	
	return (
		<div className="App-header">
			<header className="App-header">
				<h1>Oxygen/Hemoglobin Dissociation Curve</h1>
				<h4>Oxygen saturation percent (SpO<sub>2</sub> %) based on arterial partial pressure of oxygen (PaO<sub>2</sub>)</h4>
			</header>

			<Row className="mb-3 row"></Row>

			<Row className="mb-3 row">
				<Col xs="auto">
					<h5>Input Parameters</h5>
					<Form>
						<Form.Group as={Row} className="mb-1" controlId="formTp">
							<Form.Label column>Body Temperature</Form.Label>
							<Col sm={6}>
								<InputGroup className="mb-1">
									<Form.Control value={tp} onChange={handleTpChange} />
									<InputGroup.Text> Â°C </InputGroup.Text>
								</InputGroup>
							</Col>
						</Form.Group>
						<Form.Group as={Row} className="mb-1" controlId="formPh">
							<Form.Label column>Arterial Boold Ph</Form.Label>
							<Col sm={6}>
								<InputGroup className="mb-1">
									<InputGroup.Text>{Number(ph).toFixed(1)}</InputGroup.Text>
									<InputGroup.Text>Acidic</InputGroup.Text>
									<Form.Control type="range" min="7.0" max="8.0" step=".1" value={ph} onChange={handlePhChange} />
									<InputGroup.Text>Basic</InputGroup.Text>
								</InputGroup>
							</Col>
						</Form.Group>
						<Form.Group as={Row} className="mb-1" controlId="formPaco2">
							<Form.Label column>Arterial Partial Pressure CO<sub>2</sub></Form.Label>
							<Col sm={6}>
								<InputGroup className="mb-1">
									<Form.Control value={paco2} onChange={handlePaco2Change} />
									<InputGroup.Text>mmHg</InputGroup.Text>
								</InputGroup>
							</Col>
						</Form.Group>
						<Form.Group as={Row} className="mb-1" controlId="formButtons">
							<Col />
							<Col sm={6}>
								<Button variant="primary" onClick={handleSubmit}>Submit</Button>{' '}
								<Button variant="secondary"onClick={handleReset}>Reset</Button>
							</Col>
						</Form.Group>
					</Form>
				</Col>
				<Col xs="auto">
					<div id="hbCurve"></div>
				</Col>
			</Row>
		</div>
	);
}