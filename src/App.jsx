import { Table,Button,Flex,Form,Popover,Input,Spin,Modal,Empty,Space} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useState ,useEffect} from 'react';

export default function Books(){
  const [books,setBooks]=useState([]);
  const [loading,setLoading]=useState(false);
  const [clickBookid,setClickBookid]=useState('');
  const url = 'http://lesson.creaverse.cc/books';

  const handleclickbookid=(e)=>{
    setClickBookid(e.id)
  }

  //修改图书
  const modifyBook=async (upbook)=>{
    await fetch(`${url}/${clickBookid}`,{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upbook),
    }).then(response=>response.json()).then(response=>{console.log(`修改成功${JSON.stringify(response)}`)})
    fetchshowbooks();
  }
  //添加图书
  const addnewbook=async(newbook)=>{
    await fetch(url,{
      method:"POST",
      headers:{
        'Content-Type': 'application/json' 
      },
      body:JSON.stringify(newbook)
    }).then(response=>response.json).then(response=>console.log(`添加成功${JSON.stringify(response)}`))
    fetchshowbooks();
  }
  //显示所有图书
  async function fetchshowbooks() {
    setLoading(true);
    await fetch('http://lesson.creaverse.cc/books?page=1&limit=20').then(response => response.json())
      .then(data => setBooks(data.data.map(e => ({
        'id': e.id,
        'title': e.title,
        'author': e.author,
        'createdAt': e.createdAt,
        'updatedAt': e.updatedAt
      }))))
   .catch(err=>(console.log(err.message)))
    setLoading(false);
  }

  useEffect(() => {
    fetchshowbooks();
  }, [])

  //删除图书
  const delbook=async()=>{
    await fetch(`${url}/${clickBookid}`,{method:'DELETE'}).then(response=>response.json()).then(e=>console.log(`删除成功${JSON.stringify(e)}`))
    fetchshowbooks();
  }
  const columns= [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '图书',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title:'创造日期',
      dataIndex:'createdAt',
      key:'createdAt'
    },
    {
      title:'上次更新',
      dataIndex:'updatedAt',
      key:'updatedAt'
    },
    {
      title:'功能',
      dataIndex:'delete',
      key:'delete',
      render: () => (
        <Flex gap='middle'>
          <ModifyBook modifyBook={modifyBook}/>
          <DelbookPopover delbook={delbook}/>
        </Flex>
      )
    }
  ]
  return (
    <div>
      <h2>图书管理系统</h2>
      <Space>
      <Addbook addnewbook={addnewbook} />
      <SearchBook setBooks={setBooks}></SearchBook>
      </Space>
      {loading ? (<Spin size='large' />) : (books.length > 0 ? (<Table dataSource={books} columns={columns} onRow={(date) => {
        return {
          onClick: () => {
            handleclickbookid(date);
          }
        };
      }} />) : (
        <Empty></Empty>
      ))}
    </div>
  )
}

//添加图书组件
const Addbook=({addnewbook})=>{
  const [open,setOpen]=useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [newbook,setNewBook]=useState({title:'',author:''});
  const handleCancel=()=>{
    setOpen(false);
  }
   //获取输入图书的信息
   const onValuesChange=(changedValues, allValues)=>{
    setNewBook(allValues)
  }
  const [form]=useForm();
  return(
    <>
    <Button onClick={()=>{setOpen(true)}}>添加图书</Button>
      <Modal
        title='添加图书'
        open={open}
        onCancel={handleCancel}
        onOk={async ()=>{
          setConfirmLoading(true);
          await addnewbook(newbook);
          setConfirmLoading(false);
          handleCancel();
        }}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <Form name={form} 
        labelCol={{ span: 4 }}
        onValuesChange={onValuesChange}
        >
          <Form.Item label='title' name='title'>
            <Input />
          </Form.Item>
          <Form.Item label='author' name='author'>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
//删除图书组件
const DelbookPopover = ({delbook}) => {
  const [delopen,setOpendel]=useState(false);
  const [bottonloading,setButtonloading]=useState(false);
  const handlDelbook=()=>{
    setOpendel(!delopen);
  }
  const handleOpenChange=newopen=>{
    setOpendel(newopen);
  }
  return (
    <>
      <Popover content=
        {<Flex gap='middle'>
          <Button type='text' onClick={handlDelbook}>取消</Button>
          <Button type='link'
            loading={bottonloading}
            onClick={async () => {
              setButtonloading(true)
              await delbook();
              setOpendel(false);
              setButtonloading(false)
            }}>确定</Button>
        </Flex>}
        title='确定删除吗'
        trigger='click'
        open={delopen}
        onOpenChange={handleOpenChange}
      >
        <Button type='primary' name='del'>删除</Button>
      </Popover>
    </>
  )
}

//编辑图书组件
const ModifyBook=({modifyBook})=>{
  const [open,setOpen]=useState(false);
  const [upbook,setUpbook]=useState({title:'',author:''});
  const [loading,setLoading]=useState(false);
  const [modiform]=useForm('');

  const onCancel=()=>{
    setOpen(false);
  }
  const onValuesChange=(changedValues, allValues)=>{
    setUpbook(allValues)
  }
  return(
    <>
    <Button onClick={()=>{setOpen(true)}}>编辑</Button>
    <Modal 
    open={open}
    title='修改图书'
    onCancel={onCancel}
    confirmLoading={loading}
    onOk={async ()=>{
      setLoading(true);
      await modifyBook(upbook);
      onCancel();
      setLoading(false);
      setUpbook({title:'',author:''});
    }}
    destroyOnClose={true}
    >
      <Form name={modiform}
      onValuesChange={onValuesChange}
      labelCol={{ span: 4 }}
      >
        <Form.Item label='title' name='title'>
          <Input disabled={loading}></Input>
        </Form.Item>
        <Form.Item label='author' name='author'>
          <Input disabled={loading}></Input>
        </Form.Item>
      </Form>
    </Modal>
    </>
  )
}
//搜索组件 
const SearchBook=({setBooks})=>{
  const {Search}=Input;
  const findBook=async (e)=>{
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
      search: `${e}`,
      sortBy: 'title',
      order: 'asc'
  });
  await fetch(`http://lesson.creaverse.cc/books?${params}`).then(response=>response.json())
  .then(data=>setBooks(data.data.map(e => ({
    'id': e.id,
    'title': e.title,
    'author': e.author,
    'createdAt': e.createdAt,
    'updatedAt': e.updatedAt
  })))).catch(err=>console.log(err.message))
  }
  return(
    <>
    <Search onSearch={(e)=>findBook(e)} style={{width:200}}></Search>
    </>
  )
}