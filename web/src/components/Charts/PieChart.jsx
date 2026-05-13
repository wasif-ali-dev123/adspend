import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/dataTransformations';

const PieChart = ({ data, nameKey, valueKey, title, height = 400 }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();
    
    const width = svgRef.current.clientWidth;
    const radius = Math.min(width, height) / 2 - 40;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d[nameKey]))
      .range(d3.schemeCategory10);
    
    const pie = d3.pie()
      .value(d => d[valueKey])
      .sort(null);
    
    const data_ready = pie(data);

    const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);
    
    const outerArc = d3.arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);
    
    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', d => color(d.data[nameKey]))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('opacity', 1);
        
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`${d.data[nameKey]}<br/>${formatCurrency(d.data[valueKey])}`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 0.8);
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
    
    svg.selectAll('text')
      .data(data_ready)
      .join('text')
      .text(d => {
        const percentage = (d.data[valueKey] / d3.sum(data, d => d[valueKey])) * 100;
        return percentage > 5 ? d.data[nameKey] : '';
      })
      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.8 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', d => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? 'start' : 'end';
      })
      .style('font-size', '12px');
    
    svg.selectAll('polyline')
      .data(data_ready)
      .join('polyline')
      .attr('points', d => {
        const percentage = (d.data[valueKey] / d3.sum(data, d => d[valueKey])) * 100;
        if (percentage <= 5) return null;
        
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.8 * (midangle < Math.PI ? 1 : -1);
        return [arcGenerator.centroid(d), outerArc.centroid(d), pos];
      })
      .style('fill', 'none')
      .style('stroke', '#999')
      .style('stroke-width', '1px')
      .style('opacity', d => {
        const percentage = (d.data[valueKey] / d3.sum(data, d => d[valueKey])) * 100;
        return percentage > 5 ? 1 : 0;
      });
    
    const legendRectSize = 18;
    const legendSpacing = 4;
    const legendGroup = d3.select(svgRef.current)
      .append('g')
      .attr('class', 'legend-group')
      .attr('transform', `translate(${width - 160}, ${60})`);

const legend = legendGroup.selectAll('.legend')
  .data(data.slice(0, 10))
  .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', (d, i) => {
    const height = legendRectSize + legendSpacing;
    const vert = i * height;
    return `translate(0, ${vert})`;
  });

    
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', d => color(d[nameKey]))
      .style('stroke', d => color(d[nameKey]));
    
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(d => {
        const name = d[nameKey];
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      })
      .style('font-size', '12px');
    
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

    return () => {
      d3.select('body').selectAll('.d3-tooltip').remove();
    };
  }, [data, nameKey, valueKey, height]);
  
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
      <svg ref={svgRef} width="100%" height={height} />
    </Box>
  );
};

export default PieChart;
