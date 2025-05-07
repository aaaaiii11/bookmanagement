import { Table, Button, Flex, Form, Popover, Input, Modal, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useState, useEffect} from 'react';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchbook,setSearchbook]=useState('');
  const [pagination,setPagination]=useState({
    current:1,
    pageSize:10,
    total:0,
    sortBy:'createdAt',
    pageSizeOptions:[10,20,50,100],
    showSizeChanger:true
  })
  const url = 'http://lesson.creaverse.cc/books';
  
  
  //显示所有图书
  async function fetchshowbooks() {
    const params= new URLSearchParams({
      page: pagination.current.toString(),
      limit: pagination.pageSize.toString(),
      sortBy: 'title',
      order: 'asc',
      
    })
    if(searchbook){
      params.append('search',searchbook);
    }
    setLoading(true);
    await fetch(`http://lesson.creaverse.cc/books?${params}`)
    .then(response => response.json())
      .then(data => {
        setPagination({
          ...pagination,
          total:`${data.pagination.totalItems}`
        }
        )
        return (setBooks(data.data.map(e => ({
          'id': e.id,
          'title': e.title,
          'author': e.author,
          'createdAt': e.createdAt,
          'updatedAt': e.updatedAt
        }))))
      })
      .catch(err => (console.log(err.message)))
    setLoading(false);
  }
//页码发生变化的时候
  const handleOnchange=(pagination)=>{
    console.log(pagination);
    
    setPagination({
     ...pagination
    })
  }

  useEffect(() => {
    fetchshowbooks();
  }, [pagination.current,searchbook,pagination.pageSize])

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      sorter:{
        compare:(a,b)=>a.id - b.id,
      }
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
      title: '创造日期',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '上次更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt'
    },
    {
      title: '功能',
      dataIndex: 'delete',
      key: 'delete',
      render: (value, record) => (
        <Flex gap='middle'>
          <ModifyBook fetchshowbooks={fetchshowbooks} book={record} url={url} />
          <DelbookPopover fetchshowbooks={fetchshowbooks} url={url} bookid={record.id} />
        </Flex>
      )
    }
  ]
  return (
    <div>
      <h2>图书管理系统</h2>
      <Space>
        <Addbook fetchshowbooks={fetchshowbooks} url={url} />
        <SearchBook setSearchbook={setSearchbook} setPagination={setPagination} pagination={pagination}></SearchBook>
      </Space>
      <Table loading={loading} dataSource={books} columns={columns} pagination={pagination} onChange={handleOnchange}/>
    </div>
  )
}
//添加图书组件 
const Addbook = ({ fetchshowbooks, url }) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [newbook, setNewBook] = useState({ title: '', author: '' });
  const [form] = useForm();

  const addnewbook = async () => {
    await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newbook)
    }).then(response => response.json).then(response => console.log(`添加成功${JSON.stringify(response)}`))
    fetchshowbooks();
  }

  const handleCancel = () => {
    setOpen(false);
  }
  //获取输入图书的信息
  const onValuesChange = (changedValues, allValues) => {
    setNewBook(allValues)
  }

  return (
    <>
      <Button onClick={() => { setOpen(true) }}>添加图书</Button>
      <Modal
        title='添加图书'
        open={open}
        onCancel={handleCancel}
        onOk={async () => {
          setConfirmLoading(true);
          await addnewbook();
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
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item label='author' name='author'>
            <Input disabled={confirmLoading} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
//删除图书组件
const DelbookPopover = ({ fetchshowbooks, url, bookid }) => {
  const [delopen, setOpendel] = useState(false);
  const [bottonloading, setButtonloading] = useState(false);
  const handlDelbook = () => {
    setOpendel(!delopen);
  }
  const handleOpenChange = newopen => {
    setOpendel(newopen);
  }

  const delbook = async () => {
    await fetch(`${url}/${bookid}`, { method: 'DELETE' }).then(response => response.json()).then(e => console.log(`删除成功${JSON.stringify(e)}`))
    fetchshowbooks();
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
const ModifyBook = ({ fetchshowbooks, book, url }) => {
  const [open, setOpen] = useState(false);
  const [upbook, setUpbook] = useState({ title: '', author: '' });
  const [loading, setLoading] = useState(false);
  const [modiform] = useForm('');

  const modifyBook = async () => {
    await fetch(`${url}/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upbook),
    }).then(response => response.json()).then(response => { console.log(`修改成功${JSON.stringify(response)}`) })
    fetchshowbooks();
  }

  const onCancel = () => {
    setOpen(false);
  }
  const onValuesChange = (changedValues, allValues) => {
    setUpbook(allValues)
  }
  return (
    <>
      <Button onClick={() => { setOpen(true) }}>编辑</Button>
      <Modal
        open={open}
        title='修改图书'
        onCancel={onCancel}
        confirmLoading={loading}
        onOk={async () => {
          setLoading(true);
          await modifyBook();
          onCancel();
          setLoading(false);
          setUpbook({ title: '', author: '' });
        }}
        destroyOnClose={true}
      >
        <Form name={modiform}
          onValuesChange={onValuesChange}
          labelCol={{ span: 4 }}
        >
          <Form.Item label='title' name='title'>
            <Input disabled={loading} defaultValue={book.title}></Input>
          </Form.Item>
          <Form.Item label='author' name='author'>
            <Input disabled={loading} defaultValue={book.author}></Input>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
//搜索组件 
const SearchBook = ({setSearchbook,setPagination,pagination}) => {
  const { Search } = Input;
  const findBook = (e) => {
    setPagination({
      ...pagination,
      current:'1',
    })
    setSearchbook(e);
    }
  return (
    <>
      <Search onSearch={findBook} style={{ width: 200 }}></Search>
    </>
  )
}