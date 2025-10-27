const tableData = [
  {
    id: 1,
    ligandCode: "cpd1",
    name: "cpd1",
    structure: "C1=CC=C(C=C1)C2=CC=CC=C2", // SMILES or structure data
    status: "pass", // pass, warning, fail
    image: "" // 分子2D图片URL
  },
  {
    id: 2,
    ligandCode: "cpd2",
    name: "cpd2",
    structure: "C1=CC=C(C=C1)C2=CC=CC=C2",
    status: "fail",
    image: ""
  },
  {
    id: 3,
    ligandCode: "cpd3",
    name: "cpd3",
    structure: "C1=CC=C(C=C1)C2=CC=CC=C2",
    status: "warning",
    image: ""
  }
];

export { tableData };
