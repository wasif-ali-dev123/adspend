import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/dataTransformations';

const LineChart = ({ data, xKey, yKey, title, height = 400 }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    d3.select(svgRef.current).selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 120, left: 120 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
      .domain(data.map(d => d[xKey]))
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[yKey]) * 1.1])
      .range([chartHeight, 0]);
    
    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('pointer-events', 'none');

    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatCurrency(d)))
      .selectAll('text')
      .style('font-size', '12px');
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', chartHeight + margin.bottom - 5)
      .style('font-size', '14px')
      .text('Date');
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -chartHeight / 2)
      .style('font-size', '14px')
      .text('Spend ($)');
    
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1976d2')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => x(d[xKey]) + x.bandwidth() / 2)
        .y(d => y(d[yKey]))
      );
    
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d[xKey]) + x.bandwidth() / 2)
      .attr('cy', d => y(d[yKey]))
      .attr('r', 5)
      .attr('fill', '#1976d2')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('fill', '#2196f3');
        
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`${d[xKey]}<br/>${formatCurrency(d[yKey])}`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 5)
          .attr('fill', '#1976d2');
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2)
      .selectAll('line')
      .style('stroke', '#ddd');
    
    return () => {
      d3.select('body').selectAll('.d3-tooltip').remove();
    };
  }, [data, xKey, yKey, height]);
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom align="center">
          {title}
        </Typography>
      )}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <svg ref={svgRef} width="100%" height={height} />
      </Box>
    </Box>
  );
};

export default LineChart;
