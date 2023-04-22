import styled from 'styled-components';

export const ActionsWrapper = styled.div`
`;


export const Button = styled.button`
  /* Adapt the colors based on primary prop */
  position: relative;
  background-color: palevioletred;
  border: none;
  font-size: 14px;
  color: #FFFFFF;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
  text-align: center;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
  text-decoration: none;
  overflow: hidden;
  cursor: pointer;


  &:after {
    content: "";
    background: white;
    display: block;
    position: absolute;
    padding-top: 300%;
    padding-left: 350%;
    margin-left: -20px!important;
    margin-top: -120%;
    opacity: 0;
    transition: all 0.8s
  }

  &:active:after {
    padding: 0;
    margin: 0;
    opacity: 1;
    transition: 0s
  }

`;

